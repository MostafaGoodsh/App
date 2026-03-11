import { useState, useRef, useEffect } from "react";
import { useWheelOfFortune } from "@/hooks/useWheelOfFortune";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";

const WheelOfFortune = () => {
  const { segments, settings, todaySpins, spinning, loading, canSpin, isFree, spinWheel } = useWheelOfFortune();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const animRef = useRef<number>();

  // Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;
    const segAngle = (2 * Math.PI) / segments.length;

    ctx.clearRect(0, 0, size, size);

    // Draw segments
    segments.forEach((seg, i) => {
      const startAngle = i * segAngle + rotation;
      const endAngle = startAngle + segAngle;

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      // Border
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${size < 280 ? 11 : 13}px sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 3;
      ctx.fillText(seg.label, radius - 16, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, 2 * Math.PI);
    ctx.fillStyle = "#D4AF37";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center icon
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎰", center, center);
  }, [segments, rotation]);

  const handleSpin = async () => {
    if (isAnimating || !canSpin()) return;

    setResult(null);
    setIsAnimating(true);

    const winner = await spinWheel();
    if (!winner) {
      setIsAnimating(false);
      return;
    }

    // Animate spin
    const winnerIndex = segments.findIndex((s) => s.id === winner.id);
    const segAngle = (2 * Math.PI) / segments.length;
    // Target: pointer at top (- PI/2), land on winner center
    const targetAngle = -(winnerIndex * segAngle + segAngle / 2) - Math.PI / 2;
    const totalRotation = targetAngle + Math.PI * 2 * (6 + Math.random() * 2); // 6-8 full rotations

    const startTime = Date.now();
    const duration = 4000;
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * ease;
      setRotation(currentRotation);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setResult(winner.label);
        if (winner.reward_type === "nothing") {
          toast("حظ أفضل المرة القادمة! 🍀", { description: winner.label });
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
    <Card className="border-primary/30 bg-gradient-to-b from-card to-card/80 overflow-hidden">
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2 text-lg arabic-text">
          <Sparkles className="w-5 h-5 text-primary" />
          {settings.title}
        </CardTitle>
        {settings.description && (
          <p className="text-xs text-muted-foreground arabic-text">{settings.description}</p>
        )}
        {settings.intro_text && (
          <p className="text-xs text-muted-foreground/70 arabic-text mt-1">{settings.intro_text}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pb-6">
        {/* Wheel */}
        <div className="relative">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
          </div>
          <canvas
            ref={canvasRef}
            width={260}
            height={260}
            className="rounded-full shadow-2xl shadow-primary/20 border-4 border-primary/30"
          />
        </div>

        {/* Result */}
        {result && (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-2 justify-center">
              <Gift className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary text-lg">{result}</span>
            </div>
          </div>
        )}

        {/* Spin Button & Info */}
        <div className="text-center space-y-2 w-full">
          <Button
            onClick={handleSpin}
            disabled={isAnimating || !canSpin()}
            size="lg"
            className="w-full max-w-[200px] gap-2 font-bold"
          >
            {isAnimating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التدوير...
              </>
            ) : (
              <>
                🎰 {isFree() ? "لف مجاناً!" : `لف (${settings?.spin_cost_xp} XP)`}
              </>
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground">
            لفات اليوم: {todaySpins} / {settings?.free_spins_per_day || 0} مجانية
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WheelOfFortune;
