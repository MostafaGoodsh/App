import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const LuckyDice = () => {
  const { toast } = useToast();
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
          setLastWin(200);
          toast({ title: '🏆 Double Six!', description: '+200 XP' });
        } else if (total === 7) {
          setLastWin(50);
          toast({ title: '🍀 Lucky 7!', description: '+50 XP' });
        } else if (isDouble) {
          setLastWin(30);
          toast({ title: '🎯 Double!', description: '+30 XP' });
        } else if (total >= 10) {
          setLastWin(15);
          toast({ title: '✨ Nice roll!', description: '+15 XP' });
        } else {
          setLastWin(0);
        }
      }
    }, 80);
  }, [rolling, toast]);

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-base font-bold text-[#D4AF37]">𓂀 Lucky Dice</h3>
        <p className="text-[10px] text-[#D4AF37]/40">نرد الحظ</p>
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
            <p className="text-[#D4AF37]/40 text-xs">Try again!</p>
          )
        )}
      </div>

      <Button
        onClick={roll}
        disabled={rolling}
        className="w-full bg-[#D4AF37] text-black hover:bg-[#C4A032] font-bold text-sm h-10"
      >
        {rolling ? '...' : 'ROLL'}
      </Button>

      <div className="grid grid-cols-2 gap-1 text-[9px] text-[#D4AF37]/40">
        <span>Double 6 → 200 XP</span>
        <span>Lucky 7 → 50 XP</span>
        <span>Any Double → 30 XP</span>
        <span>10+ → 15 XP</span>
      </div>
    </div>
  );
};

export default LuckyDice;
