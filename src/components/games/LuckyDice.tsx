import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useGameSettings } from '@/hooks/useGameSettings';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const LuckyDice = () => {
  const { toast } = useToast();
  const { settings } = useGameSettings('lucky_dice');
  const ROLL_COST = settings?.spin_cost_xp ?? 5;
  const REWARDS = settings?.rewards ?? { double_six: 200, lucky_seven: 50, any_double: 30, ten_plus: 15 };
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const roll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    setLastWin(null);

    let count = 0;
    const interval = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      count++;
      if (count > 12) {
        clearInterval(interval);
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setDice([d1, d2]);
        setRolling(false);

        const total = d1 + d2;
        const isDouble = d1 === d2;
        
        if (total === 12) {
          setLastWin(REWARDS.double_six);
          toast({ title: '🏆 Double Six!', description: `+${REWARDS.double_six} XP` });
        } else if (total === 7) {
          setLastWin(REWARDS.lucky_seven);
          toast({ title: '🍀 Lucky 7!', description: `+${REWARDS.lucky_seven} XP` });
        } else if (isDouble) {
          setLastWin(REWARDS.any_double);
          toast({ title: '🎯 Double!', description: `+${REWARDS.any_double} XP` });
        } else if (total >= 10) {
          setLastWin(REWARDS.ten_plus);
          toast({ title: '✨ Nice roll!', description: `+${REWARDS.ten_plus} XP` });
        } else {
          setLastWin(0);
        }
      }
    }, 80);
  }, [rolling, toast, REWARDS]);

  if (settings && !settings.is_active) {
    return (
      <div className="text-center py-6 text-[#D4AF37]/60 text-sm">
        🚧 اللعبة غير مفعّلة حالياً
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-base font-bold text-[#D4AF37]">𓂀 Lucky Dice</h3>
        <p className="text-[10px] text-[#D4AF37]/40">نرد الحظ</p>
      </div>

      {/* Roll Cost */}
      <div className="text-center">
        <span className="text-xs text-[#D4AF37]/60 bg-black/40 px-3 py-1 rounded-full border border-[#D4AF37]/20">
          سعر الرمية: {ROLL_COST} XP
        </span>
      </div>

      <div className="flex justify-center gap-3">
        {dice.map((d, i) => (
          <div
            key={i}
            className={`w-16 h-16 rounded-xl bg-black/50 border border-[#D4AF37]/30 flex items-center justify-center text-4xl transition-transform ${rolling ? 'animate-bounce' : ''}`}
          >
            {DICE_FACES[d - 1]}
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xl font-bold text-[#D4AF37]">{dice[0] + dice[1]}</p>
        {lastWin !== null && !rolling && (
          lastWin > 0 ? (
            <p className="text-[#D4AF37] font-bold text-sm animate-bounce">+{lastWin} XP 🎉</p>
          ) : (
            <p className="text-[#D4AF37]/40 text-xs">حاول مرة تانية!</p>
          )
        )}
      </div>

      <Button
        onClick={roll}
        disabled={rolling}
        className="w-full bg-[#D4AF37] text-black hover:bg-[#C4A032] font-bold text-sm h-10"
      >
        {rolling ? '...' : `ROLL (-${ROLL_COST} XP)`}
      </Button>

      {/* Win Rules */}
      <div className="rounded-lg bg-black/40 border border-[#D4AF37]/15 p-2.5 space-y-1">
        <p className="text-[10px] text-[#D4AF37]/70 font-bold text-center mb-1">قواعد المكسب</p>
        <div className="grid grid-cols-2 gap-1 text-[9px] text-[#D4AF37]/50">
          <span>Double 6 (12) → {REWARDS.double_six} XP</span>
          <span>Lucky 7 → {REWARDS.lucky_seven} XP</span>
          <span>أي دبل → {REWARDS.any_double} XP</span>
          <span>10+ → {REWARDS.ten_plus} XP</span>
        </div>
      </div>
    </div>
  );
};

export default LuckyDice;
