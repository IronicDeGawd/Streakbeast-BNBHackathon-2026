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
