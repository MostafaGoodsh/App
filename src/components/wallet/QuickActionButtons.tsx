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
      color: 'from-primary/20 to-primary/30 border-primary/40 text-primary'
    },
    {
      label: 'إرسال',
      labelEn: 'Send',
      icon: Send,
      onClick: onSend,
      color: 'from-primary/25 to-primary/35 border-primary/50 text-primary'
    },
    {
      label: 'اربح',
      labelEn: 'Earn',
      icon: Coins,
      onClick: onEarn,
      color: 'from-primary/30 to-primary/40 border-primary/60 text-primary'
    },
    {
      label: 'تبديل',
      labelEn: 'Swap',
      icon: ArrowRightLeft,
      onClick: onSwap,
      color: 'from-primary/20 to-primary/30 border-primary/40 text-primary'
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
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {actions.map((action) => (
        <button
          key={action.labelEn}
          onClick={action.onClick}
          className={cn(
            "flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl",
            "bg-gradient-to-br border-2 transition-all duration-200",
            "hover:scale-105 hover:shadow-lg",
            action.color
          )}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/50 flex items-center justify-center">
            <action.icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs sm:text-sm font-medium">{action.label}</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground/70">{action.labelEn}</span>
          </div>
        </button>
      ))}
    </div>
  );
};
