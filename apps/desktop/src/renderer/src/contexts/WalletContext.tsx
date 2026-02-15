/**
 * WalletContext - React Context adapting Reown AppKit to provide wallet state
 * Exposes the same useWallet() interface as before, but powered by AppKit under the hood
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { BrowserProvider, JsonRpcSigner, formatEther } from 'ethers';
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
  useAppKit,
  modal,
} from '@reown/appkit/react';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { opBNBTestnet, opBNBMainnet } from '../config/appkit';

/**
 * EIP-1193 provider type for useAppKitProvider generic
 */
interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

/**
 * Target chain — opBNB Testnet
 */
const TARGET_CHAIN_ID = 5611;

/**
 * WalletContext type definition
 */
export interface WalletContextType {
  account: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  balance: string;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: number) => Promise<void>;
  isWrongNetwork: boolean;
}

interface WalletProviderProps {
  children: ReactNode;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Map of numeric chainId to AppKit chain objects for switchNetwork
 */
const chainMap: Record<number, AppKitNetwork> = {
  5611: opBNBTestnet,
  204: opBNBMainnet,
};

/**
 * WalletProvider component
 * Wraps AppKit hooks and exposes ethers.js v6 provider/signer to consumers
 */
export function WalletProvider({ children }: WalletProviderProps): React.ReactElement {
  // AppKit hooks
  const { address, isConnected: appkitConnected } = useAppKitAccount();
  const { chainId: appkitChainId, switchNetwork } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider<Eip1193Provider>('eip155');
  const { open } = useAppKit();

  // Derived ethers objects
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const switchAttempted = useRef(false);

  // Rebuild ethers provider/signer whenever walletProvider or chain changes
  useEffect(() => {
    let cancelled = false;

    async function buildEthers(): Promise<void> {
      if (!walletProvider || !appkitConnected) {
        setProvider(null);
        setSigner(null);
        setBalance('0');
        return;
      }

      try {
        const ethersProvider = new BrowserProvider(walletProvider);
        const ethersSigner = await ethersProvider.getSigner();

        if (!cancelled) {
          setProvider(ethersProvider);
          setSigner(ethersSigner);
        }

        // Fetch balance
        if (address && !cancelled) {
          const balanceWei = await ethersProvider.getBalance(address);
          if (!cancelled) {
            setBalance(formatEther(balanceWei));
          }
        }
      } catch (err) {
        console.error('Failed to build ethers provider:', err);
        if (!cancelled) {
          setProvider(null);
          setSigner(null);
          setBalance('0');
        }
      }
    }

    buildEthers();

    return () => {
      cancelled = true;
    };
  }, [walletProvider, appkitConnected, appkitChainId, address]);

  // Auto-switch to opBNB Testnet when connected on wrong network
  // Uses wallet_addEthereumChain first (required for WalletConnect + mobile wallets)
  // then wallet_switchEthereumChain as fallback
  useEffect(() => {
    if (!appkitConnected || !appkitChainId || Number(appkitChainId) === TARGET_CHAIN_ID) return;
    if (!walletProvider) return;
    if (switchAttempted.current) return; // Only attempt once per session
    switchAttempted.current = true;

    const hexChainId = '0x' + TARGET_CHAIN_ID.toString(16); // 0x15eb

    async function autoSwitch() {
      console.log(`[Wallet] Wrong network (${appkitChainId}), requesting switch to opBNB Testnet…`);

      // Step 1: Try wallet_addEthereumChain first (tells wallet about the custom chain)
      // This is required for WalletConnect + MetaMask Mobile for custom/testnet chains
      try {
        await walletProvider!.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: hexChainId,
            chainName: 'opBNB Testnet',
            nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
            rpcUrls: ['https://opbnb-testnet-rpc.bnbchain.org'],
            blockExplorerUrls: ['https://testnet.opbnbscan.com'],
          }],
        });
        console.log('[Wallet] wallet_addEthereumChain succeeded');
      } catch (addErr: any) {
        // Error code 4902 means chain already exists — that's fine
        // Some wallets throw if chain is already added
        if (addErr?.code !== 4902) {
          console.warn('[Wallet] wallet_addEthereumChain failed:', addErr);
        }
      }

      // Step 2: Now try wallet_switchEthereumChain
      try {
        await walletProvider!.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: hexChainId }],
        });
        console.log('[Wallet] wallet_switchEthereumChain succeeded');
      } catch (switchErr: any) {
        console.warn('[Wallet] wallet_switchEthereumChain failed:', switchErr);
        // Final fallback: try AppKit's switchNetwork
        try {
          const target = chainMap[TARGET_CHAIN_ID];
          if (target) switchNetwork(target);
        } catch (fallbackErr) {
          console.error('[Wallet] All switch attempts failed:', fallbackErr);
          setError('Please switch to opBNB Testnet manually in your wallet');
        }
      }
    }

    autoSwitch();
  }, [appkitConnected, appkitChainId, walletProvider, switchNetwork]);

  // Connect: open AppKit modal
  const connect = useCallback(async (): Promise<void> => {
    setIsConnecting(true);
    setError(null);
    try {
      await open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open wallet modal');
    } finally {
      setIsConnecting(false);
    }
  }, [open]);

  // Disconnect via AppKit modal instance
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      if (modal) {
        await modal.disconnect();
      }
      switchAttempted.current = false; // Reset for next connection
    } catch (err) {
      console.error('Failed to disconnect:', err);
    } finally {
      setProvider(null);
      setSigner(null);
      setBalance('0');
      setError(null);
    }
  }, []);

  // Switch chain
  const switchChain = useCallback(
    async (targetChainId: number): Promise<void> => {
      const network = chainMap[targetChainId];
      if (!network) {
        setError(`Unsupported chain: ${targetChainId}`);
        return;
      }
      try {
        setError(null);
        switchNetwork(network);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to switch chain');
      }
    },
    [switchNetwork],
  );

  // Map AppKit state to our interface
  const account = appkitConnected && address ? address : null;
  const chainId = appkitChainId ? Number(appkitChainId) : null;
  const isConnected = appkitConnected && !!address;
  const isWrongNetwork = isConnected && chainId !== null && chainId !== TARGET_CHAIN_ID;

  const contextValue = useMemo<WalletContextType>(
    () => ({
      account,
      chainId,
      provider,
      signer,
      balance,
      isConnecting,
      isConnected,
      error,
      connect,
      disconnect,
      switchChain,
      isWrongNetwork,
    }),
    [
      account,
      chainId,
      provider,
      signer,
      balance,
      isConnecting,
      isConnected,
      error,
      connect,
      disconnect,
      switchChain,
      isWrongNetwork,
    ],
  );

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
}

/**
 * useWallet custom hook
 */
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export { WalletContext };
