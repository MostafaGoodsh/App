import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SYMBOLS = ['🪙', '💎', '⭐', '𓆣', '☥', '🏆', '7️⃣', '🎰'];
const REEL_COUNT = 3;

const getRandomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

const SlotMachine = () => {
  const { toast } = useToast();
  const [reels, setReels] = useState<string[]>(['🎰', '🎰', '🎰']);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setLastWin(null);

    // Spin each reel with staggered stop
    const finalReels: string[] = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

    REEL_COUNT > 0 && Array.from({ length: REEL_COUNT }).forEach((_, i) => {
      const interval = setInterval(() => {
        setReels(prev => {
          const next = [...prev];
          next[i] = getRandomSymbol();
          return next;
        });
      }, 80);
      intervalRefs.current[i] = interval;

      setTimeout(() => {
        clearInterval(interval);
        setReels(prev => {
          const next = [...prev];
          next[i] = finalReels[i];
          return next;
        });

        // On last reel stop, calculate result
        if (i === REEL_COUNT - 1) {
          setTimeout(() => {
            setSpinning(false);
            const allSame = finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2];
            const twoSame = finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2];
            
            if (allSame) {
              const isScarab = finalReels[0] === '𓆣';
              const win = isScarab ? 500 : 100;
              setLastWin(win);
              toast({ title: isScarab ? '🏆 JACKPOT!' : '🎉 Winner!', description: `+${win} XP` });
            } else if (twoSame) {
              setLastWin(10);
              toast({ title: '✨ Small win!', description: '+10 XP' });
            } else {
              setLastWin(0);
            }
          }, 200);
        }
      }, 600 + i * 400);
    });
  }, [spinning, toast]);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border border-[#D4AF37]/30 p-4 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-[#D4AF37]">🎰 Lucky Slots</h3>
        <p className="text-[10px] text-[#D4AF37]/40">ماكينة الحظ</p>
      </div>

      {/* Reels */}
      <div className="flex justify-center gap-2">
        {reels.map((symbol, i) => (
          <div
            key={i}
            className={`w-20 h-20 rounded-xl bg-black/60 border-2 border-[#D4AF37]/40 flex items-center justify-center text-4xl transition-transform ${spinning ? 'animate-pulse' : ''}`}
          >
            {symbol}
          </div>
        ))}
      </div>

      {/* Result */}
      {lastWin !== null && !spinning && (
        <div className="text-center">
          {lastWin > 0 ? (
            <p className="text-[#D4AF37] font-bold text-sm animate-bounce">+{lastWin} XP 🎉</p>
          ) : (
            <p className="text-[#D4AF37]/40 text-xs">Try again!</p>
          )}
        </div>
      )}

      {/* Spin Button */}
      <Button
        onClick={spin}
        disabled={spinning}
        className="w-full bg-[#D4AF37] text-black hover:bg-[#C4A032] font-bold text-base h-11"
      >
        {spinning ? '...' : 'SPIN'}
      </Button>
    </div>
  );
};

export default SlotMachine;
