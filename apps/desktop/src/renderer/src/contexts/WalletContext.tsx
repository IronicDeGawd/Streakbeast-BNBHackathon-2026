/**
 * WalletContext - React Context for managing WalletConnect v2 + ethers.js v6 wallet connections
 * Provides wallet state, connection management, and blockchain interaction capabilities
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
import EthereumProvider from '@walletconnect/ethereum-provider';
// CHAIN_CONFIG available from '../contracts/addresses' if needed

/**
 * WalletContext type definition
 * Defines the shape of the wallet context state and methods
 */
export interface WalletContextType {
  /** Connected wallet address */
  account: string | null;
  /** Current chain ID */
  chainId: number | null;
  /** Ethers.js browser provider instance */
  provider: BrowserProvider | null;
  /** Ethers.js signer instance */
  signer: JsonRpcSigner | null;
  /** Formatted wallet balance */
  balance: string;
  /** Connection in progress flag */
  isConnecting: boolean;
  /** Connected state */
  isConnected: boolean;
  /** Error message if any */
  error: string | null;
  /** Connect wallet function */
  connect: () => Promise<void>;
  /** Disconnect wallet function */
  disconnect: () => Promise<void>;
  /** Switch chain function */
  switchChain: (chainId: number) => Promise<void>;
}

/**
 * WalletProvider props
 */
interface WalletProviderProps {
  children: ReactNode;
}

/**
 * WalletContext instance
 */
const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * WalletProvider component
 * Manages WalletConnect v2 connection state and provides wallet functionality to child components
 */
export function WalletProvider({ children }: WalletProviderProps): React.ReactElement {
  // State management
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wcProvider, setWcProvider] = useState<EthereumProvider | null>(null);

  /**
   * Initialize WalletConnect Ethereum Provider
   * Creates and configures the WalletConnect provider instance
   */
  const initProvider = useCallback(async (): Promise<EthereumProvider> => {
    const ethereumProvider = await EthereumProvider.init({
      projectId: '0000000000000000000000000000000000000000', // Placeholder WalletConnect project ID
      chains: [5611], // opBNB Testnet
      optionalChains: [204], // opBNB Mainnet
      showQrModal: true,
      metadata: {
        name: 'StreakBeast',
        description: 'Gamified habit tracker',
        url: 'https://streakbeast.xyz',
        icons: [],
      },
    });

    return ethereumProvider;
  }, []);

  /**
   * Fetch and update wallet balance
   * Retrieves the current balance for the connected account
   */
  const fetchBalance = useCallback(
    async (currentProvider: BrowserProvider, currentAccount: string): Promise<void> => {
      try {
        const balanceWei = await currentProvider.getBalance(currentAccount);
        const balanceFormatted = formatEther(balanceWei);
        setBalance(balanceFormatted);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        setBalance('0');
      }
    },
    [],
  );

  /**
   * Connect wallet
   * Initiates WalletConnect connection flow and sets up provider/signer
   */
  const connect = useCallback(async (): Promise<void> => {
    setIsConnecting(true);
    setError(null);

    try {
      // Initialize provider if not already initialized
      let currentWcProvider = wcProvider;
      if (!currentWcProvider) {
        currentWcProvider = await initProvider();
        setWcProvider(currentWcProvider);
      }

      // Enable WalletConnect session
      const accounts = await currentWcProvider.enable();

      // Wrap in ethers.js BrowserProvider
      const ethersProvider = new BrowserProvider(currentWcProvider);
      setProvider(ethersProvider);

      // Get signer
      const ethersSigner = await ethersProvider.getSigner();
      setSigner(ethersSigner);

      // Get account address
      const accountAddress = accounts[0] ?? null;
      setAccount(accountAddress);

      // Get chain ID
      const network = await ethersProvider.getNetwork();
      setChainId(Number(network.chainId));

      // Fetch balance
      if (accountAddress) {
        await fetchBalance(ethersProvider, accountAddress);
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [wcProvider, initProvider, fetchBalance]);

  /**
   * Disconnect wallet
   * Terminates WalletConnect session and clears all state
   */
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      if (wcProvider) {
        await wcProvider.disconnect();
      }
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
    } finally {
      // Clear all state
      setAccount(null);
      setChainId(null);
      setProvider(null);
      setSigner(null);
      setBalance('0');
      setError(null);
      setWcProvider(null);
    }
  }, [wcProvider]);

  /**
   * Switch blockchain network
   * Requests chain switch through WalletConnect
   */
  const switchChain = useCallback(
    async (targetChainId: number): Promise<void> => {
      if (!wcProvider) {
        setError('Wallet not connected');
        return;
      }

      try {
        setError(null);
        await wcProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
      } catch (err) {
        console.error('Failed to switch chain:', err);
        setError(err instanceof Error ? err.message : 'Failed to switch chain');
      }
    },
    [wcProvider],
  );

  /**
   * Handle accounts changed event
   * Updates account state when user switches accounts in wallet
   */
  const handleAccountsChanged = useCallback(
    async (accounts: string[]): Promise<void> => {
      if (accounts.length === 0) {
        // User disconnected all accounts
        await disconnect();
      } else {
        const newAccount = accounts[0] ?? null;
        setAccount(newAccount);
        if (provider && newAccount) {
          await fetchBalance(provider, newAccount);
        }
      }
    },
    [provider, disconnect, fetchBalance],
  );

  /**
   * Handle chain changed event
   * Updates chain state when user switches networks
   */
  const handleChainChanged = useCallback(
    async (newChainId: string | number): Promise<void> => {
      const chainIdNumber = typeof newChainId === 'string' ? parseInt(newChainId, 16) : newChainId;
      setChainId(chainIdNumber);

      // Refresh provider and signer for new chain
      if (wcProvider && account) {
        const ethersProvider = new BrowserProvider(wcProvider);
        setProvider(ethersProvider);

        const ethersSigner = await ethersProvider.getSigner();
        setSigner(ethersSigner);

        await fetchBalance(ethersProvider, account);
      }
    },
    [wcProvider, account, fetchBalance],
  );

  /**
   * Handle disconnect event
   * Clears state when wallet disconnects
   */
  const handleDisconnect = useCallback(async (): Promise<void> => {
    await disconnect();
  }, [disconnect]);

  /**
   * Setup event listeners
   * Registers WalletConnect event handlers
   */
  useEffect(() => {
    if (!wcProvider) return;

    wcProvider.on('accountsChanged', handleAccountsChanged);
    wcProvider.on('chainChanged', handleChainChanged);
    wcProvider.on('disconnect', handleDisconnect);

    return () => {
      wcProvider.removeListener('accountsChanged', handleAccountsChanged);
      wcProvider.removeListener('chainChanged', handleChainChanged);
      wcProvider.removeListener('disconnect', handleDisconnect);
    };
  }, [wcProvider, handleAccountsChanged, handleChainChanged, handleDisconnect]);

  /**
   * Auto-reconnect on mount
   * Restores session if WalletConnect session exists
   */
  useEffect(() => {
    const autoReconnect = async (): Promise<void> => {
      try {
        const ethereumProvider = await initProvider();
        setWcProvider(ethereumProvider);

        // Check if session exists
        if (ethereumProvider.session) {
          const accounts = ethereumProvider.accounts;
          if (accounts.length > 0) {
            // Restore connection state
            const ethersProvider = new BrowserProvider(ethereumProvider);
            setProvider(ethersProvider);

            const ethersSigner = await ethersProvider.getSigner();
            setSigner(ethersSigner);

            const accountAddress = accounts[0] ?? null;
            setAccount(accountAddress);

            const network = await ethersProvider.getNetwork();
            setChainId(Number(network.chainId));

            if (accountAddress) {
              await fetchBalance(ethersProvider, accountAddress);
            }
          }
        }
      } catch (err) {
        console.error('Failed to auto-reconnect:', err);
      }
    };

    autoReconnect();
  }, [initProvider, fetchBalance]);

  /**
   * Cleanup on unmount
   * Removes event listeners when component unmounts
   */
  useEffect(() => {
    return () => {
      if (wcProvider) {
        wcProvider.removeListener('accountsChanged', handleAccountsChanged);
        wcProvider.removeListener('chainChanged', handleChainChanged);
        wcProvider.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [wcProvider, handleAccountsChanged, handleChainChanged, handleDisconnect]);

  /**
   * Compute derived state
   * isConnected is true when account is set
   */
  const isConnected = useMemo(() => account !== null, [account]);

  /**
   * Context value
   */
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
 * Provides access to wallet context
 * @throws Error if used outside WalletProvider
 */
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export { WalletContext };