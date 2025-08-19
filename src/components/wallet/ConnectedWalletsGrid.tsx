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
    return (
      <div className="space-y-6">
        <div className="text-center py-16 px-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">لا توجد محافظ متصلة</h3>
          <p className="text-muted-foreground">قم بتوصيل محفظتك أعلاه لبدء الاستخدام</p>
        </div>
      </div>
    );
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