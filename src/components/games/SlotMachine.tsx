import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SYMBOLS = ['☥', '𓆣', '𓂀', '𓌀', '𓊽', '𓋹', '𓃭', '𓅃'];
const COLS = 5;
const ROWS = 3;

const getRandomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
const getRandomColumn = () => Array.from({ length: ROWS }, () => getRandomSymbol());

const SlotMachine = () => {
  const { toast } = useToast();
  const [reels, setReels] = useState<string[][]>(() =>
    Array.from({ length: COLS }, () => Array.from({ length: ROWS }, () => '𓆣'))
  );
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [winRow, setWinRow] = useState<number | null>(null);
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setLastWin(null);
    setWinRow(null);

    const finalReels = Array.from({ length: COLS }, () => getRandomColumn());

    Array.from({ length: COLS }).forEach((_, i) => {
      const interval = setInterval(() => {
        setReels(prev => {
          const next = [...prev];
          next[i] = getRandomColumn();
          return next;
        });
      }, 90);
      intervalRefs.current[i] = interval;

      setTimeout(() => {
        clearInterval(interval);
        setReels(prev => {
          const next = [...prev];
          next[i] = finalReels[i];
          return next;
        });

        if (i === COLS - 1) {
          setTimeout(() => {
            setSpinning(false);
            let bestWin = 0;
            let bestRow: number | null = null;
            for (let r = 0; r < ROWS; r++) {
              const rowSymbols = finalReels.map(col => col[r]);
              const allFive = rowSymbols.every(s => s === rowSymbols[0]);
              const fourMatch = rowSymbols.filter(s => s === rowSymbols[0]).length >= 4 || 
                rowSymbols.filter(s => s === rowSymbols[1]).length >= 4;
              const threeMatch = rowSymbols.filter(s => s === rowSymbols[0]).length >= 3 ||
                rowSymbols.filter(s => s === rowSymbols[1]).length >= 3 ||
                rowSymbols.filter(s => s === rowSymbols[2]).length >= 3;
              
              if (allFive) {
                const isScarab = rowSymbols[0] === '𓆣';
                const win = isScarab ? 1000 : 300;
                if (win > bestWin) { bestWin = win; bestRow = r; }
              } else if (fourMatch) {
                const win = 100;
                if (win > bestWin) { bestWin = win; bestRow = r; }
              } else if (threeMatch && bestWin < 20) {
                bestWin = 20; bestRow = r;
              }
            }
            // Middle row bonus
            const mid = finalReels.map(col => col[1]);
            if (mid.every(s => s === mid[0]) && bestWin < 500) {
              bestWin = mid[0] === '𓆣' ? 500 : 200;
              bestRow = 1;
            }
            setLastWin(bestWin);
            if (bestRow !== null && bestWin > 0) setWinRow(bestRow);
            if (bestWin >= 500) toast({ title: '🏆 JACKPOT!', description: `+${bestWin} XP` });
            else if (bestWin >= 100) toast({ title: '🎉 Winner!', description: `+${bestWin} XP` });
            else if (bestWin > 0) toast({ title: '✨ Small win!', description: `+${bestWin} XP` });
          }, 400);
        }
      }, 800 + i * 500);
    });
  }, [spinning, toast]);

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-base font-bold text-[#D4AF37]">𓆣 Lucky Slots</h3>
        <p className="text-[10px] text-[#D4AF37]/40">ماكينة الحظ</p>
      </div>

      {/* Reel Grid: 5 rows × 3 columns */}
      <div className="relative rounded-xl bg-black/60 border border-[#D4AF37]/20 p-2 overflow-hidden">
        {/* Middle row highlight */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2.2rem] bg-[#D4AF37]/10 border-y border-[#D4AF37]/30 pointer-events-none z-10" />
        
        <div className="grid gap-[2px]">
          {Array.from({ length: ROWS }).map((_, row) => (
            <div
              key={row}
              className={`flex justify-center gap-1 ${winRow === row && !spinning ? 'animate-pulse' : ''}`}
            >
              {reels.map((reel, col) => (
                <div
                  key={col}
                  className={`w-[3.2rem] h-[2rem] rounded bg-black/50 flex items-center justify-center text-lg transition-all
                    ${row === 1 ? 'border border-[#D4AF37]/20' : ''}
                    ${spinning ? 'blur-[1px]' : ''}`}
                >
                  {reel[row]}
                </div>
              ))}
            </div>
          ))}
        </div>
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

      <Button
        onClick={spin}
        disabled={spinning}
        className="w-full bg-[#D4AF37] text-black hover:bg-[#C4A032] font-bold text-sm h-10"
      >
        {spinning ? '...' : 'SPIN'}
      </Button>
    </div>
  );
};

export default SlotMachine;
