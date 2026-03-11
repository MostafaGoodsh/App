import { useState, useRef, useEffect, useCallback } from "react";
import { useWheelOfFortune } from "@/hooks/useWheelOfFortune";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Egyptian symbols for decoration
const EGYPTIAN_SYMBOLS = ['☥', '𓂀', '𓆣', '𓊽', '𓌀', '𓁢', '𓃭', '𓅃'];

// Bonus wheel segments for $MS-RA prizes
const BONUS_SEGMENTS = [
  { label: '1 $MS-RA', value: 1, color: '#D4AF37' },
  { label: '2 $MS-RA', value: 2, color: '#1a1a2e' },
  { label: '5 $MS-RA', value: 5, color: '#B8860B' },
  { label: '0.5 $MS-RA', value: 0.5, color: '#2d2d44' },
  { label: '10 $MS-RA', value: 10, color: '#DAA520' },
  { label: '3 $MS-RA', value: 3, color: '#0d0d1a' },
  { label: '0.1 $MS-RA', value: 0.1, color: '#C5A028' },
  { label: '7 $MS-RA', value: 7, color: '#1f1f35' },
];

const drawEgyptianWheel = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  segments: Array<{ label: string; color: string; reward_type?: string }>,
  rotation: number,
  isBonus: boolean = false
) => {
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 10;
  const segAngle = (2 * Math.PI) / segments.length;

  ctx.clearRect(0, 0, size, size);

  // Outer decorative ring
  ctx.beginPath();
  ctx.arc(center, center, radius + 6, 0, 2 * Math.PI);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Egyptian pattern outer ring
  const patternRadius = radius + 2;
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const x = center + Math.cos(angle) * patternRadius;
    const y = center + Math.sin(angle) * patternRadius;
    ctx.fillStyle = i % 2 === 0 ? '#D4AF37' : '#B8860B';
    ctx.font = '8px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◆', x, y);
  }

  // Draw segments
  segments.forEach((seg, i) => {
    const startAngle = i * segAngle + rotation;
    const endAngle = startAngle + segAngle;

    // Segment fill
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();

    // For bonus segments or empty/"nothing" segments, add special styling
    const isBonusTrigger = !isBonus && seg.reward_type === 'nothing';

    if (isBonusTrigger) {
      // Golden gradient for bonus trigger segments
      const grad = ctx.createRadialGradient(center, center, 0, center, center, radius);
      grad.addColorStop(0, '#D4AF37');
      grad.addColorStop(1, '#B8860B');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = seg.color;
    }
    ctx.fill();

    // Segment border with gold accent
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner decorative line
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Text
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + segAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size < 280 ? 10 : 12}px sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 4;

    if (isBonusTrigger) {
      // Show Egyptian symbol + "بونص" for bonus trigger
      ctx.fillStyle = '#1a1a2e';
      ctx.font = `bold ${size < 280 ? 11 : 13}px sans-serif`;
      ctx.fillText('☥ بونص', radius - 14, 4);
    } else {
      ctx.fillText(seg.label, radius - 14, 4);
    }
    ctx.restore();

    // Egyptian symbol decoration between segments
    if (!isBonus) {
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segAngle / 2);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.font = '10px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(EGYPTIAN_SYMBOLS[i % EGYPTIAN_SYMBOLS.length], radius * 0.45, 0);
      ctx.restore();
    }
  });

  // Inner decorative ring
  ctx.beginPath();
  ctx.arc(center, center, 32, 0, 2 * Math.PI);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Center circle with Egyptian styling
  const centerGrad = ctx.createRadialGradient(center, center, 0, center, center, 28);
  centerGrad.addColorStop(0, '#D4AF37');
  centerGrad.addColorStop(0.7, '#B8860B');
  centerGrad.addColorStop(1, '#8B6914');
  ctx.beginPath();
  ctx.arc(center, center, 26, 0, 2 * Math.PI);
  ctx.fillStyle = centerGrad;
  ctx.fill();

  // Center border
  ctx.beginPath();
  ctx.arc(center, center, 26, 0, 2 * Math.PI);
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Center symbol
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 18px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
  ctx.shadowBlur = 6;
  ctx.fillText(isBonus ? '☥' : '𓂀', center, center);
  ctx.shadowBlur = 0;
};

const WheelOfFortune = () => {
  const { segments, settings, todaySpins, spinning, loading, canSpin, isFree, spinWheel } = useWheelOfFortune();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bonusCanvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [bonusRotation, setBonusRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isBonusAnimating, setIsBonusAnimating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showBonus, setShowBonus] = useState(false);
  const [bonusResult, setBonusResult] = useState<string | null>(null);
  const animRef = useRef<number>();
  const bonusAnimRef = useRef<number>();

  // Draw main wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawEgyptianWheel(ctx, canvas, segments, rotation, false);
  }, [segments, rotation]);

  // Draw bonus wheel
  useEffect(() => {
    const canvas = bonusCanvasRef.current;
    if (!canvas || !showBonus) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawEgyptianWheel(ctx, canvas, BONUS_SEGMENTS, bonusRotation, true);
  }, [showBonus, bonusRotation]);

  const spinBonusWheel = useCallback(() => {
    setIsBonusAnimating(true);
    setBonusResult(null);

    // Weighted random - lower values more likely
    const weights = BONUS_SEGMENTS.map(s => 1 / (s.value + 0.1));
    const totalW = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalW;
    let winnerIdx = 0;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { winnerIdx = i; break; }
    }

    const winner = BONUS_SEGMENTS[winnerIdx];
    const segAngle = (2 * Math.PI) / BONUS_SEGMENTS.length;
    const targetAngle = -(winnerIdx * segAngle + segAngle / 2) - Math.PI / 2;
    const totalRot = targetAngle + Math.PI * 2 * (5 + Math.random() * 3);

    const startTime = Date.now();
    const duration = 3500;
    const startRot = bonusRotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setBonusRotation(startRot + totalRot * ease);

      if (progress < 1) {
        bonusAnimRef.current = requestAnimationFrame(animate);
      } else {
        setIsBonusAnimating(false);
        setBonusResult(winner.label);
        toast.success(`☥ مبروك! ربحت ${winner.label}`, {
          description: `جائزة البونص: +${winner.value} $MS-RA`,
        });
      }
    };

    bonusAnimRef.current = requestAnimationFrame(animate);
  }, [bonusRotation]);

  const handleSpin = async () => {
    if (isAnimating || isBonusAnimating || !canSpin()) return;

    setResult(null);
    setBonusResult(null);
    setShowBonus(false);
    setIsAnimating(true);

    const winner = await spinWheel();
    if (!winner) {
      setIsAnimating(false);
      return;
    }

    const winnerIndex = segments.findIndex((s) => s.id === winner.id);
    const segAngle = (2 * Math.PI) / segments.length;
    const targetAngle = -(winnerIndex * segAngle + segAngle / 2) - Math.PI / 2;
    const totalRotation = targetAngle + Math.PI * 2 * (6 + Math.random() * 2);

    const startTime = Date.now();
    const duration = 4000;
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * ease;
      setRotation(currentRotation);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setResult(winner.label);

        if (winner.reward_type === "nothing") {
          // Trigger bonus wheel!
          toast("☥ بونص! عجلة $MS-RA الذهبية!", {
            description: "وقف السهم على البونص - لف عجلة الجوائز الذهبية!",
          });
          setTimeout(() => {
            setShowBonus(true);
          }, 800);
        } else {
          toast.success(`🎉 مبروك! ربحت ${winner.label}`, {
            description: winner.reward_description || `+${winner.reward_value} ${winner.reward_type.toUpperCase()}`,
          });
        }
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (bonusAnimRef.current) cancelAnimationFrame(bonusAnimRef.current);
    };
  }, []);

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!settings?.is_visible || segments.length === 0) return null;

  return (
    <Card className="border-amber-500/40 bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] overflow-hidden relative">
      {/* Egyptian corner decorations */}
      <div className="absolute top-2 left-3 text-amber-500/40 text-lg select-none">𓅃</div>
      <div className="absolute top-2 right-3 text-amber-500/40 text-lg select-none">𓁢</div>
      <div className="absolute bottom-2 left-3 text-amber-500/40 text-lg select-none">𓆣</div>
      <div className="absolute bottom-2 right-3 text-amber-500/40 text-lg select-none">𓌀</div>

      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2 text-lg text-amber-400 arabic-text">
          <span className="text-xl">☥</span>
          {settings.title}
          <span className="text-xl">☥</span>
        </CardTitle>
        {settings.description && (
          <p className="text-xs text-amber-500/70 arabic-text">{settings.description}</p>
        )}
        {settings.intro_text && (
          <p className="text-xs text-amber-500/50 arabic-text mt-1">{settings.intro_text}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pb-6">
        {/* Main Wheel */}
        {!showBonus && (
          <div className="relative animate-in fade-in duration-300">
            {/* Pointer with Egyptian styling */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
              <div className="relative">
                <div className="w-0 h-0 border-l-[11px] border-r-[11px] border-t-[20px] border-l-transparent border-r-transparent border-t-amber-500 drop-shadow-lg" />
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[16px] border-l-transparent border-r-transparent border-t-amber-600 absolute top-[1px] left-1/2 -translate-x-1/2" />
              </div>
            </div>

            {/* Hieroglyphic border symbols rotating */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {EGYPTIAN_SYMBOLS.slice(0, 4).map((sym, i) => {
                const angle = (i / 4) * Math.PI * 2 - Math.PI / 4;
                const r = 145;
                return (
                  <span
                    key={i}
                    className="absolute text-amber-500/30 text-sm select-none"
                    style={{
                      transform: `translate(${Math.cos(angle) * r}px, ${Math.sin(angle) * r}px)`,
                    }}
                  >
                    {sym}
                  </span>
                );
              })}
            </div>

            <canvas
              ref={canvasRef}
              width={270}
              height={270}
              className="rounded-full shadow-2xl shadow-amber-500/20 border-[3px] border-amber-500/50"
            />
          </div>
        )}

        {/* Bonus Wheel */}
        {showBonus && (
          <div className="relative animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-3">
              <p className="text-amber-400 font-bold arabic-text text-sm">☥ عجلة $MS-RA الذهبية ☥</p>
              <p className="text-amber-500/60 text-xs arabic-text">لف العجلة لربح جوائز $MS-RA</p>
            </div>

            {/* Pointer */}
            <div className="absolute top-[calc(0px+2.5rem)] left-1/2 -translate-x-1/2 -translate-y-1 z-10">
              <div className="relative">
                <div className="w-0 h-0 border-l-[11px] border-r-[11px] border-t-[20px] border-l-transparent border-r-transparent border-t-amber-400 drop-shadow-lg" />
              </div>
            </div>

            <canvas
              ref={bonusCanvasRef}
              width={270}
              height={270}
              className="rounded-full shadow-2xl shadow-amber-400/30 border-[3px] border-amber-400/60"
            />

            {!isBonusAnimating && !bonusResult && (
              <div className="mt-3 text-center">
                <Button
                  onClick={spinBonusWheel}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold gap-2"
                  size="lg"
                >
                  ☥ لف عجلة البونص!
                </Button>
              </div>
            )}

            {isBonusAnimating && (
              <div className="mt-3 text-center">
                <p className="text-amber-400 text-sm animate-pulse arabic-text">𓂀 جاري تدوير عجلة البونص...</p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && !showBonus && (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-2 justify-center">
              <Gift className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-amber-400 text-lg">{result}</span>
            </div>
          </div>
        )}

        {bonusResult && (
          <div className="text-center animate-in fade-in zoom-in duration-500 mt-2">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-amber-400 font-bold text-lg">☥ {bonusResult}</p>
              <p className="text-amber-500/70 text-xs arabic-text">تمت إضافة الجائزة لحسابك</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              onClick={() => { setShowBonus(false); setBonusResult(null); }}
            >
              العودة للعجلة الرئيسية
            </Button>
          </div>
        )}

        {/* Spin Button & Info (only show for main wheel) */}
        {!showBonus && (
          <div className="text-center space-y-2 w-full">
            <Button
              onClick={handleSpin}
              disabled={isAnimating || isBonusAnimating || !canSpin()}
              size="lg"
              className="w-full max-w-[220px] gap-2 font-bold bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-600 hover:to-amber-400 text-black border border-amber-400/30"
            >
              {isAnimating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="arabic-text">جاري التدوير...</span>
                </>
              ) : (
                <>
                  <span>☥</span>
                  <span className="arabic-text">{isFree() ? "لف مجاناً!" : `لف (${settings?.spin_cost_xp} XP)`}</span>
                </>
              )}
            </Button>
            <div className="flex items-center justify-center gap-3 text-[11px] text-amber-500/60">
              <span>𓆣</span>
              <span className="arabic-text">لفات اليوم: {todaySpins} / {settings?.free_spins_per_day || 0} مجانية</span>
              <span>𓆣</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WheelOfFortune;
