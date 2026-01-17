import { Button } from "@/components/ui/button";
import { ArrowDownLeft, Send, Coins, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionButtonsProps {
  onReceive?: () => void;
  onSend?: () => void;
  onEarn?: () => void;
  onSwap?: () => void;
  variant?: 'default' | 'compact';
}

export const QuickActionButtons = ({
  onReceive,
  onSend,
  onEarn,
  onSwap,
  variant = 'default'
}: QuickActionButtonsProps) => {
  const actions = [
    {
      label: 'استلام',
      labelEn: 'Receive',
      icon: ArrowDownLeft,
      onClick: onReceive,
      color: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-600 dark:text-green-400'
    },
    {
      label: 'إرسال',
      labelEn: 'Send',
      icon: Send,
      onClick: onSend,
      color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-600 dark:text-blue-400'
    },
    {
      label: 'اربح',
      labelEn: 'Earn',
      icon: Coins,
      onClick: onEarn,
      color: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-600 dark:text-amber-400'
    },
    {
      label: 'تبديل',
      labelEn: 'Swap',
      icon: ArrowRightLeft,
      onClick: onSwap,
      color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-600 dark:text-purple-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="flex gap-2 justify-center">
        {actions.map((action) => (
          <Button
            key={action.labelEn}
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className={cn(
              "flex-1 max-w-24 flex flex-col items-center gap-1 h-auto py-3",
              "bg-gradient-to-br border-2",
              action.color
            )}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => (
        <button
          key={action.labelEn}
          onClick={action.onClick}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl",
            "bg-gradient-to-br border-2 transition-all duration-200",
            "hover:scale-105 hover:shadow-lg",
            action.color
          )}
        >
          <div className="w-12 h-12 rounded-full bg-background/50 flex items-center justify-center">
            <action.icon className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
};
