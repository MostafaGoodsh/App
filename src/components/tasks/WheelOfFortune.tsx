import { useState, useRef, useEffect, useCallback } from "react";
import { useWheelOfFortune } from "@/hooks/useWheelOfFortune";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Gift } from "lucide-react";
import { toast } from "sonner";

const EGYPTIAN_SYMBOLS = ['☥', '𓂀', '𓆣', '𓊽', '𓌀', '𓁢', '𓃭', '𓅃'];

const FALLBACK_BONUS_SEGMENTS = [
  { label: '1 $MS-RA', value: 1, color: '#D4AF37' },
  { label: '2 $MS-RA', value: 2, color: '#1a1a2e' },
  { label: '5 $MS-RA', value: 5, color: '#B8860B' },
  { label: '0.5 $MS-RA', value: 0.5, color: '#2d2d44' },
  { label: '10 $MS-RA', value: 10, color: '#DAA520' },
  { label: '3 $MS-RA', value: 3, color: '#0d0d1a' },
  { label: '0.1 $MS-RA', value: 0.1, color: '#C5A028' },
  { label: '7 $MS-RA', value: 7, color: '#1f1f35' },
];

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const parts = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const part of parts) {
    const test = current ? `${current} ${part}` : part;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = part;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const drawDualRingWheel = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  xpSegments: Array<{ label: string; color: string; reward_type?: string }>,
  msraSegments: Array<{ label: string; color: string }>,
  outerRotation: number,
  innerRotation: number,
) => {
  const size = canvas.width;
  const center = size / 2;
  const outerRadius = center - 12;
  const innerRadius = outerRadius * 0.58; // bigger inner ring
  const dividerRadius = outerRadius * 0.62;
  const innerCenterRadius = 28;

  ctx.clearRect(0, 0, size, size);

  // === Outer decorative ring ===
  ctx.beginPath();
  ctx.arc(center, center, outerRadius + 6, 0, 2 * Math.PI);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Diamond pattern
  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2;
    const x = center + Math.cos(angle) * (outerRadius + 3);
    const y = center + Math.sin(angle) * (outerRadius + 3);
    ctx.fillStyle = i % 2 === 0 ? '#D4AF37' : '#B8860B';
    ctx.font = '7px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◆', x, y);
  }

  // === OUTER RING: $MS-RA tokens ===
  const outerSegAngle = (2 * Math.PI) / msraSegments.length;
  msraSegments.forEach((seg, i) => {
    const startAngle = i * outerSegAngle + outerRotation;
    const endAngle = startAngle + outerSegAngle;

    ctx.beginPath();
    ctx.arc(center, center, outerRadius, startAngle, endAngle);
    ctx.arc(center, center, dividerRadius, endAngle, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = seg.color;
    ctx.fill();

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Horizontal text for $MS-RA
    const midAngle = startAngle + outerSegAngle / 2;
    const textR = dividerRadius + (outerRadius - dividerRadius) / 2;
    const tx = center + Math.cos(midAngle) * textR;
    const ty = center + Math.sin(midAngle) * textR;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size < 340 ? 8 : 10}px sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 4;

    // Write horizontally (no rotation)
    const maxW = (outerRadius - dividerRadius) * 0.85;
    const lines = wrapText(ctx, seg.label, maxW);
    const lineH = size < 340 ? 10 : 12;
    const startY = ty - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, li) => {
      ctx.fillText(line, tx, startY + li * lineH);
    });

    ctx.shadowBlur = 0;
    ctx.restore();

    // Egyptian symbol at segment boundary
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle);
    ctx.fillStyle = 'rgba(212, 175, 55, 0.5)';
    ctx.font = '9px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(EGYPTIAN_SYMBOLS[i % EGYPTIAN_SYMBOLS.length], outerRadius - 8, 0);
    ctx.restore();
  });

  // === Divider ring ===
  ctx.beginPath();
  ctx.arc(center, center, dividerRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Ankh symbols on divider
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = center + Math.cos(angle) * dividerRadius;
    const y = center + Math.sin(angle) * dividerRadius;
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 8px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☥', x, y);
  }

  // === INNER RING: XP segments ===
  const innerSegAngle = (2 * Math.PI) / xpSegments.length;
  xpSegments.forEach((seg, i) => {
    const startAngle = i * innerSegAngle + innerRotation;
    const endAngle = startAngle + innerSegAngle;

    ctx.beginPath();
    ctx.arc(center, center, innerRadius, startAngle, endAngle);
    ctx.arc(center, center, innerCenterRadius, endAngle, startAngle, true);
    ctx.closePath();

    const isBonusTrigger = seg.reward_type === 'nothing';
    if (isBonusTrigger) {
      const grad = ctx.createRadialGradient(center, center, innerCenterRadius, center, center, innerRadius);
      grad.addColorStop(0, '#C5A028');
      grad.addColorStop(1, '#8B6914');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = seg.color;
    }
    ctx.fill();

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Horizontal text for XP / Bonus
    const midAngle = startAngle + innerSegAngle / 2;
    const innerTextR = innerCenterRadius + (innerRadius - innerCenterRadius) / 2;
    const tx = center + Math.cos(midAngle) * innerTextR;
    const ty = center + Math.sin(midAngle) * innerTextR;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 3;

    if (isBonusTrigger) {
      ctx.fillStyle = '#1a1a2e';
      ctx.font = `bold ${size < 340 ? 9 : 11}px sans-serif`;
      ctx.fillText('☥ بونص', tx, ty);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${size < 340 ? 8 : 10}px sans-serif`;
      const maxW = (innerRadius - innerCenterRadius) * 0.8;
      const lines = wrapText(ctx, seg.label, maxW);
      const lineH = size < 340 ? 9 : 11;
      const startY = ty - ((lines.length - 1) * lineH) / 2;
      lines.forEach((line, li) => {
        ctx.fillText(line, tx, startY + li * lineH);
      });
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  });

  // === Center circle ===
  const centerGrad = ctx.createRadialGradient(center, center, 0, center, center, innerCenterRadius);
  centerGrad.addColorStop(0, '#D4AF37');
  centerGrad.addColorStop(0.7, '#B8860B');
  centerGrad.addColorStop(1, '#8B6914');
  ctx.beginPath();
  ctx.arc(center, center, innerCenterRadius, 0, 2 * Math.PI);
  ctx.fillStyle = centerGrad;
  ctx.fill();
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
  ctx.fillText('𓂀', center, center);
  ctx.shadowBlur = 0;
};

const WheelOfFortune = () => {
  const { segments, settings, todaySpins, spinning, loading, canSpin, isFree, spinWheel } = useWheelOfFortune();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [outerRotation, setOuterRotation] = useState(0);
  const [innerRotation, setInnerRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isBonusAnimating, setIsBonusAnimating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [bonusResult, setBonusResult] = useState<string | null>(null);
  const animRef = useRef<number>();
  const bonusAnimRef = useRef<number>();
  const [bonusSegments, setBonusSegments] = useState(FALLBACK_BONUS_SEGMENTS);

  // Fetch outer segments from DB
  useEffect(() => {
    supabase.from("wheel_outer_segments").select("*").eq("is_active", true).order("display_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setBonusSegments(data.map((s: any) => ({ label: s.label, value: Number(s.reward_value), color: s.color })));
        }
      });
  }, []);

  // Draw combined wheel: outer=$MS-RA, inner=XP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawDualRingWheel(ctx, canvas, segments, bonusSegments, outerRotation, innerRotation);
  }, [segments, bonusSegments, outerRotation, innerRotation]);

  // Spin the OUTER ring ($MS-RA) when bonus triggered
  const spinBonusRing = useCallback(() => {
    setIsBonusAnimating(true);
    setBonusResult(null);

    const weights = bonusSegments.map(s => 1 / (s.value + 0.1));
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
    const totalRot = targetAngle + Math.PI * 2 * (6 + Math.random() * 3);

    const startTime = Date.now();
    const duration = 3500;
    const startRot = outerRotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setOuterRotation(startRot + totalRot * ease);

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
  }, [outerRotation]);

  // Spin the INNER ring (XP)
  const handleSpin = async () => {
    if (isAnimating || isBonusAnimating || !canSpin()) return;

    setResult(null);
    setBonusResult(null);
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
    const startRotation = innerRotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setInnerRotation(startRotation + totalRotation * ease);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);

        if (winner.reward_type === "nothing") {
          setResult("☥ بونص! الحلقة الخارجية تدور...");
          toast("☥ بونص! الحلقة الخارجية لـ $MS-RA تدور الآن!", {
            description: "وقف السهم على البونص - الحلقة الخارجية تدور تلقائياً!",
          });
          setTimeout(() => {
            spinBonusRing();
          }, 800);
        } else {
          setResult(winner.label);
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
        {/* Dual-ring wheel */}
        <div className="relative">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
            <div className="relative">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-amber-500 drop-shadow-lg" />
              <div className="w-0 h-0 border-l-[9px] border-r-[9px] border-t-[17px] border-l-transparent border-r-transparent border-t-amber-600 absolute top-[1px] left-1/2 -translate-x-1/2" />
            </div>
          </div>

          {/* Hieroglyphic border symbols */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {EGYPTIAN_SYMBOLS.slice(0, 4).map((sym, i) => {
              const angle = (i / 4) * Math.PI * 2 - Math.PI / 4;
              const r = 170;
              return (
                <span
                  key={i}
                  className="absolute text-amber-500/25 text-sm select-none"
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
            width={340}
            height={340}
            className="rounded-full shadow-2xl shadow-amber-500/20 border-[3px] border-amber-500/50"
          />

          {/* Bonus indicator */}
          {isBonusAnimating && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-amber-500/20 backdrop-blur-sm rounded-full px-3 py-1 animate-pulse">
                <span className="text-amber-400 text-[10px] font-bold">$MS-RA 🎰</span>
              </div>
            </div>
          )}
        </div>

        {/* Ring labels */}
        <div className="flex items-center justify-center gap-4 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-500/60 arabic-text" dir="ltr">الحلقة الخارجية: $MS-RA</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-700" />
            <span className="text-amber-500/60 arabic-text">الحلقة الداخلية: XP</span>
          </div>
        </div>

        {/* Results */}
        {result && !isBonusAnimating && (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-2 justify-center">
              <Gift className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-amber-400 text-lg">{result}</span>
            </div>
          </div>
        )}

        {bonusResult && (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-amber-400 font-bold text-lg">☥ {bonusResult}</p>
              <p className="text-amber-500/70 text-xs arabic-text">تمت إضافة جائزة $MS-RA لحسابك</p>
            </div>
          </div>
        )}

        {/* Spin Button & Info */}
        <div className="text-center space-y-2 w-full">
          <Button
            onClick={handleSpin}
            disabled={isAnimating || isBonusAnimating || !canSpin()}
            size="lg"
            className="w-full max-w-[220px] gap-2 font-bold bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-600 hover:to-amber-400 text-black border border-amber-400/30"
          >
            {isAnimating || isBonusAnimating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="arabic-text">{isBonusAnimating ? 'الحلقة الخارجية تدور...' : 'جاري التدوير...'}</span>
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
      </CardContent>
    </Card>
  );
};

export default WheelOfFortune;
