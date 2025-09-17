import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

// إدراج CSS styles لمحافظ Solana
import '@solana/wallet-adapter-react-ui/styles.css';

const SolanaWalletContent: React.FC<{ onConnect: (account: string, balance: string) => void }> = ({ onConnect }) => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  
  React.useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          const solBalance = (balance / LAMPORTS_PER_SOL).toFixed(4);
          onConnect(publicKey.toString(), solBalance);
        } catch (error) {
          console.error('Error fetching SOL balance:', error);
          onConnect(publicKey.toString(), '0');
        }
      }
    };

    fetchBalance();
  }, [connected, publicKey, connection, onConnect]);

  return (
    <Card className="border-purple-500/20">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-2">
          <span className="text-2xl">◎</span>
        </div>
        <CardTitle>Solana Network</CardTitle>
        <CardDescription>اتصل بمحافظ Solana</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="wallet-adapter-modal-wrapper">
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !font-medium !text-white w-full justify-center" />
        </div>
        
        {connected && (
          <div className="text-center text-sm text-muted-foreground">
            ✅ متصل بشبكة Solana
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SolanaWalletProps {
  onConnect: (account: string, balance: string) => void;
}

export const SolanaWallet: React.FC<SolanaWalletProps> = ({ onConnect }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaWalletContent onConnect={onConnect} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};