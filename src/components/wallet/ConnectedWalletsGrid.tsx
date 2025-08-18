import { WalletCard } from "./WalletCard";
import { ConnectedWallet } from "@/hooks/useWalletConnect";

interface ConnectedWalletsGridProps {
  wallets: ConnectedWallet[];
  onRefreshBalance: (wallet: ConnectedWallet) => Promise<void>;
  onSendTransaction: (wallet: ConnectedWallet, toAddress: string, amount: string) => Promise<string>;
  onDisconnect: (walletId: string) => void;
}

export const ConnectedWalletsGrid = ({ 
  wallets, 
  onRefreshBalance, 
  onSendTransaction, 
  onDisconnect 
}: ConnectedWalletsGridProps) => {
  if (wallets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">المحافظ المتصلة ({wallets.length})</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            wallet={wallet}
            onRefreshBalance={onRefreshBalance}
            onSendTransaction={onSendTransaction}
            onDisconnect={onDisconnect}
          />
        ))}
      </div>
    </div>
  );
};