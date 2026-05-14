import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGameSettings } from '@/hooks/useGameSettings';

const SYMBOLS = ['𓆣', '𓂀', '𓌀', '𓊽', '𓋹', '𓃭', '𓅃'];
const COLS = 5;
const ROWS = 3;
const SUPER_SYMBOL = '𓆣'; // Scarab - super symbol

const getRandomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
const getRandomColumn = () => Array.from({ length: ROWS }, () => getRandomSymbol());

type WinCell = { row: number; col: number };

const SlotMachine = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { settings } = useGameSettings('lucky_slots');
  const SPIN_COST = settings?.spin_cost_xp ?? 10;
  const REWARDS = settings?.rewards ?? {
    five_super: 1000, five_mid_super: 500, five_any: 300,
    five_mid: 200, four_match: 100, three_match: 20,
  };
  const [reels, setReels] = useState<string[][]>(() =>
    Array.from({ length: COLS }, () => Array.from({ length: ROWS }, () => '𓆣'))
  );
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [netResult, setNetResult] = useState<{ type: string } | null>(null);
  const [winCells, setWinCells] = useState<WinCell[]>([]);
  const [winSymbol, setWinSymbol] = useState<string | null>(null);
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);

  const processReward = async (winAmount: number) => {
    if (!user?.id) return;
    try {
      if (winAmount > 0) {
        await supabase.rpc('process_wheel_reward', {
          p_user_id: user.id,
          p_reward_type: 'xp',
          p_reward_value: winAmount,
          p_spin_cost: SPIN_COST,
          p_is_bonus: false,
        });
        setNetResult({ type: 'win' });
      } else {
        await supabase.rpc('process_wheel_reward', {
          p_user_id: user.id,
          p_reward_type: 'nothing',
          p_reward_value: 0,
          p_spin_cost: SPIN_COST,
          p_is_bonus: false,
        });
        setNetResult({ type: 'loss' });
      }
    } catch (err) {
      console.error('Slot reward error:', err);
    }
  };

  // Find the best matching symbol in a row (most frequent)
  const findBestMatch = (rowSymbols: string[]): { symbol: string; count: number; indices: number[] } => {
    const counts: Record<string, number[]> = {};
    rowSymbols.forEach((s, i) => {
      if (!counts[s]) counts[s] = [];
      counts[s].push(i);
    });
    let best = { symbol: '', count: 0, indices: [] as number[] };
    for (const [sym, indices] of Object.entries(counts)) {
      if (indices.length > best.count) {
        best = { symbol: sym, count: indices.length, indices };
      }
    }
    return best;
  };

  const spin = useCallback(() => {
    if (spinning || !user?.id) return;
    setSpinning(true);
    setLastWin(null);
    setNetResult(null);
    setWinCells([]);
    setWinSymbol(null);

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
            let bestCells: WinCell[] = [];
            let bestSymbol: string | null = null;

            for (let r = 0; r < ROWS; r++) {
              const rowSymbols = finalReels.map(col => col[r]);
              const match = findBestMatch(rowSymbols);

              if (match.count === 5) {
                const isSuper = match.symbol === SUPER_SYMBOL;
                const win = isSuper ? REWARDS.five_super : REWARDS.five_any;
                if (win > bestWin) {
                  bestWin = win;
                  bestCells = match.indices.map(c => ({ row: r, col: c }));
                  bestSymbol = match.symbol;
                }
              } else if (match.count === 4) {
                const win = REWARDS.four_match;
                if (win > bestWin) {
                  bestWin = win;
                  bestCells = match.indices.map(c => ({ row: r, col: c }));
                  bestSymbol = match.symbol;
                }
              } else if (match.count === 3 && bestWin < REWARDS.three_match) {
                bestWin = REWARDS.three_match;
                bestCells = match.indices.map(c => ({ row: r, col: c }));
                bestSymbol = match.symbol;
              }
            }

            // Middle row bonus check
            const mid = finalReels.map(col => col[1]);
            const midMatch = findBestMatch(mid);
            if (midMatch.count === 5) {
              const midWin = midMatch.symbol === SUPER_SYMBOL ? REWARDS.five_mid_super : REWARDS.five_mid;
              if (midWin > bestWin) {
                bestWin = midWin;
                bestCells = midMatch.indices.map(c => ({ row: 1, col: c }));
                bestSymbol = midMatch.symbol;
              }
            }

            setLastWin(bestWin);
            if (bestCells.length > 0) {
              setWinCells(bestCells);
              setWinSymbol(bestSymbol);
            }

            processReward(bestWin);

            if (bestWin >= 500) toast({ title: '🏆 JACKPOT!', description: `+${bestWin} XP` });
            else if (bestWin >= 100) toast({ title: '🎉 Winner!', description: `+${bestWin} XP` });
            else if (bestWin > 0) toast({ title: '✨ Small win!', description: `+${bestWin} XP` });
          }, 400);
        }
      }, 800 + i * 500);
    });
  }, [spinning, toast, user?.id, SPIN_COST, REWARDS]);

  if (settings && !settings.is_active) {
    return (
      <div className="text-center py-6 text-[#D4AF37]/60 text-sm">
        🚧 اللعبة غير مفعّلة حالياً
      </div>
    );
  }

  const isCellWin = (row: number, col: number) =>
    winCells.some(c => c.row === row && c.col === col);

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-base font-bold text-[#D4AF37]">𓆣 Lucky Slots</h3>
        <p className="text-[10px] text-[#D4AF37]/40">ماكينة الحظ</p>
      </div>

      {/* Spin Cost */}
      <div className="text-center">
        <span className="text-xs text-[#D4AF37]/60 bg-black/40 px-3 py-1 rounded-full border border-[#D4AF37]/20">
          سعر التدوير: {SPIN_COST} XP
        </span>
      </div>

      {/* Super Symbol indicator */}
      <div className="text-center">
        <span className="text-[10px] text-[#D4AF37]/50">
          ⭐ رمز خارق: <span className="text-lg align-middle">{SUPER_SYMBOL}</span> جعران (مضاعف الجوائز)
        </span>
      </div>

      {/* Reel Grid */}
      <div className="relative rounded-xl bg-black/60 border border-[#D4AF37]/20 p-2 overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2.8rem] bg-[#D4AF37]/10 border-y border-[#D4AF37]/30 pointer-events-none z-10" />
        
        <div className="grid gap-1">
          {Array.from({ length: ROWS }).map((_, row) => (
            <div key={row} className="flex justify-center gap-1">
              {reels.map((reel, col) => {
                const isWin = !spinning && isCellWin(row, col);
                return (
                  <div
                    key={col}
                    className={`w-[2.8rem] h-[2.4rem] rounded-lg flex items-center justify-center text-xl transition-all duration-300
                      ${isWin
                        ? 'bg-[#D4AF37]/30 border-2 border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.5)] scale-110 animate-pulse'
                        : row === 1
                          ? 'bg-black/50 border border-[#D4AF37]/20'
                          : 'bg-black/50'
                      }
                      ${spinning ? 'blur-[1px]' : ''}`}
                  >
                    {reel[row]}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Result - simplified */}
      {lastWin !== null && !spinning && (
        <div className="rounded-lg bg-black/50 border border-[#D4AF37]/20 p-3 space-y-1.5">
          {lastWin > 0 ? (
            <>
              <p className="text-[#D4AF37] font-bold text-sm text-center animate-bounce">
                🎉 مكسب: {lastWin} XP
                {winSymbol === SUPER_SYMBOL && <span className="ml-1">⭐</span>}
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-green-500/10 border border-green-500/20 rounded-md p-1.5 text-center">
                  <p className="text-green-400 font-bold">80% لك</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-1.5 text-center">
                  <p className="text-blue-400 font-bold">20% مجمع</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-[#D4AF37]/50 text-xs text-center">حاول مرة تانية! 💫</p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-1.5 text-center text-[10px]">
                <p className="text-red-400 font-bold">-{SPIN_COST} XP → 100% مجمع السيولة</p>
              </div>
            </>
          )}
        </div>
      )}

      <Button
        onClick={spin}
        disabled={spinning || !user?.id}
        className="w-full bg-[#D4AF37] text-black hover:bg-[#C4A032] font-bold text-sm h-10"
      >
        {spinning ? '...' : `SPIN (-${SPIN_COST} XP)`}
      </Button>

      {/* Win Rules */}
      <div className="rounded-lg bg-black/40 border border-[#D4AF37]/15 p-2.5 space-y-1">
        <p className="text-[10px] text-[#D4AF37]/70 font-bold text-center mb-1">قواعد المكسب</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px] text-[#D4AF37]/50">
          <span>5× ⭐𓆣 جعران → {REWARDS.five_super} XP</span>
          <span>5× صف الوسط ⭐𓆣 → {REWARDS.five_mid_super} XP</span>
          <span>5× أي رمز → {REWARDS.five_any} XP</span>
          <span>5× صف الوسط → {REWARDS.five_mid} XP</span>
          <span>4× تطابق → {REWARDS.four_match} XP</span>
          <span>3× تطابق → {REWARDS.three_match} XP</span>
        </div>
        <div className="border-t border-[#D4AF37]/10 mt-1.5 pt-1.5 text-[9px] text-[#D4AF37]/40 text-center space-y-0.5">
          <p>🏆 مكسب: 80% لك + 20% مجمع السيولة</p>
          <p>💀 خسارة: 100% مجمع السيولة</p>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;
