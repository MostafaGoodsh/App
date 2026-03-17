import { useState, useRef, useEffect, useCallback } from "react";
import { useWheelOfFortune } from "@/hooks/useWheelOfFortune";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Gift } from "lucide-react";
import { toast } from "sonner";

const EGYPTIAN_SYMBOLS = ['☥', '𓂀', '𓆣', '𓊽', '𓌀', '𓁢', '𓃭', '𓅃'];

const FALLBACK_BONUS_SEGMENTS = [
  { label: '1 $MS-RA', label_en: '1 $MS-RA', value: 1, probability: 10, color: '#D4AF37' },
  { label: '2 $MS-RA', label_en: '2 $MS-RA', value: 2, probability: 10, color: '#1a1a2e' },
  { label: '5 $MS-RA', label_en: '5 $MS-RA', value: 5, probability: 10, color: '#B8860B' },
  { label: '0.5 $MS-RA', label_en: '0.5 $MS-RA', value: 0.5, probability: 10, color: '#2d2d44' },
  { label: '10 $MS-RA', label_en: '10 $MS-RA', value: 10, probability: 10, color: '#DAA520' },
  { label: 'ترقية', label_en: 'Premium Wheel', value: 0, probability: 10, color: '#C5A028' },
  { label: '0.1 $MS-RA', label_en: '0.1 $MS-RA', value: 0.1, probability: 10, color: '#8B6914' },
  { label: '7 $MS-RA', label_en: '7 $MS-RA', value: 7, probability: 10, color: '#1f1f35' },
];

const FALLBACK_UPGRADE_SEGMENTS = [
  { label: 'ترقية تعدين', label_en: 'Mining Upgrade', value: 1, probability: 1, color: '#2E8B57', reward_type: 'mining_upgrade' },
  { label: '+10% معدل', label_en: '+10% Rate', value: 10, probability: 2, color: '#1a1a2e', reward_type: 'rate_boost' },
  { label: '+5 قوة', label_en: '+5 Strength', value: 5, probability: 1.5, color: '#228B22', reward_type: 'strength_boost' },
  { label: 'ترقية مجانية', label_en: 'Free Upgrade', value: 1, probability: 0.5, color: '#2d2d44', reward_type: 'free_upgrade' },
  { label: '+20% XP', label_en: '+20% XP', value: 20, probability: 1, color: '#3CB371', reward_type: 'xp_boost' },
  { label: 'نقاط مضاعفة', label_en: 'Double Points', value: 2, probability: 0.8, color: '#0d0d1a', reward_type: 'double_points' },
  { label: 'ترقية سريعة', label_en: 'Quick Upgrade', value: 1, probability: 0.7, color: '#32CD32', reward_type: 'quick_upgrade' },
  { label: '+50 قوة', label_en: '+50 Strength', value: 50, probability: 0.3, color: '#1f1f35', reward_type: 'strength_boost' },
];

type BonusSegment = {
  label: string;
  label_en?: string;
  value: number;
  probability: number;
  color: string;
};

type UpgradeSegment = {
  label: string;
  label_en?: string;
  value: number;
  probability: number;
  color: string;
  reward_type: string;
};

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

const getLocalizedLabel = (language: string, label: string, labelEn?: string) => {
  if (language === "ar" || language === "both") return label;
  return labelEn?.trim() || label;
};

const isUpgradeTriggerSegment = (segment: { label: string; label_en?: string; value: number }) => {
  const text = `${segment.label} ${segment.label_en ?? ""}`.toLowerCase();
  return segment.value <= 0 || text.includes("ترقي") || text.includes("upgrade") || text.includes("premium");
};

const pickWeightedIndex = <T extends { probability?: number }>(items: T[]) => {
  const safeWeights = items.map((item) => Math.max(Number(item.probability ?? 0), 0));
  const total = safeWeights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return Math.floor(Math.random() * items.length);

  let rand = Math.random() * total;
  for (let i = 0; i < safeWeights.length; i++) {
    rand -= safeWeights[i];
    if (rand <= 0) return i;
  }

  return Math.max(0, items.length - 1);
};

const drawTripleRingWheel = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  xpSegments: Array<{ label: string; color: string; reward_type?: string }>,
  msraSegments: Array<{ label: string; color: string }>,
  upgradeSegments: Array<{ label: string; color: string }>,
  upgradeRotation: number,
  outerRotation: number,
  innerRotation: number,
) => {
  const size = canvas.width;
  const center = size / 2;

  // Ring radii (3 rings + center) - wider rings for better text readability
  const outerEdge = center - 8;
  const ring3Outer = outerEdge;          // Upgrade ring outer
  const ring3Inner = outerEdge * 0.74;   // Wider upgrade ring
  const divider2 = outerEdge * 0.73;
  const ring2Outer = outerEdge * 0.72;   // MS-RA ring outer
  const ring2Inner = outerEdge * 0.50;   // Wider MS-RA ring
  const divider1 = outerEdge * 0.49;
  const ring1Outer = outerEdge * 0.48;   // XP ring outer
  const innerCenterRadius = 28;

  ctx.clearRect(0, 0, size, size);

  // === Outer decorative ring ===
  ctx.beginPath();
  ctx.arc(center, center, outerEdge + 5, 0, 2 * Math.PI);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    const x = center + Math.cos(angle) * (outerEdge + 3);
    const y = center + Math.sin(angle) * (outerEdge + 3);
    ctx.fillStyle = i % 2 === 0 ? '#D4AF37' : '#B8860B';
    ctx.font = '6px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◆', x, y);
  }

  // === RING 3 (outermost): Upgrade rewards ===
  const ring3SegAngle = (2 * Math.PI) / upgradeSegments.length;
  upgradeSegments.forEach((seg, i) => {
    const startAngle = i * ring3SegAngle + upgradeRotation;
    const endAngle = startAngle + ring3SegAngle;

    ctx.beginPath();
    ctx.arc(center, center, ring3Outer, startAngle, endAngle);
    ctx.arc(center, center, ring3Inner, endAngle, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = seg.color;
    ctx.fill();
    ctx.strokeStyle = '#2E8B57';
    ctx.lineWidth = 1;
    ctx.stroke();

    const midAngle = startAngle + ring3SegAngle / 2;
    const textR = ring3Inner + (ring3Outer - ring3Inner) / 2;
    const tx = center + Math.cos(midAngle) * textR;
    const ty = center + Math.sin(midAngle) * textR;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size < 400 ? 11 : 14}px sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 5;
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3;

    const maxW = (ring3Outer - ring3Inner) * 0.85;
    const lines = wrapText(ctx, seg.label, maxW);
    const lineH = size < 400 ? 12 : 15;
    const startY = ty - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, li) => {
      ctx.strokeText(line, tx, startY + li * lineH);
      ctx.fillText(line, tx, startY + li * lineH);
    });
    ctx.shadowBlur = 0;
    ctx.restore();
  });

  // === Divider 2 ===
  ctx.beginPath();
  ctx.arc(center, center, divider2, 0, 2 * Math.PI);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.stroke();

  // === RING 2 (middle): $MS-RA tokens ===
  const ring2SegAngle = (2 * Math.PI) / msraSegments.length;
  msraSegments.forEach((seg, i) => {
    const startAngle = i * ring2SegAngle + outerRotation;
    const endAngle = startAngle + ring2SegAngle;

    ctx.beginPath();
    ctx.arc(center, center, ring2Outer, startAngle, endAngle);
    ctx.arc(center, center, ring2Inner, endAngle, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = seg.color;
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1;
    ctx.stroke();

    const midAngle = startAngle + ring2SegAngle / 2;
    const textR = ring2Inner + (ring2Outer - ring2Inner) / 2;
    const tx = center + Math.cos(midAngle) * textR;
    const ty = center + Math.sin(midAngle) * textR;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size < 400 ? 11 : 14}px sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 5;
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3;

    const maxW = (ring2Outer - ring2Inner) * 0.85;
    const lines = wrapText(ctx, seg.label, maxW);
    const lineH = size < 400 ? 12 : 15;
    const startY = ty - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, li) => {
      ctx.strokeText(line, tx, startY + li * lineH);
      ctx.fillText(line, tx, startY + li * lineH);
    });
    ctx.shadowBlur = 0;
    ctx.restore();
  });

  // === Divider 1 ===
  ctx.beginPath();
  ctx.arc(center, center, divider1, 0, 2 * Math.PI);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = center + Math.cos(angle) * divider1;
    const y = center + Math.sin(angle) * divider1;
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 7px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☥', x, y);
  }

  // === RING 1 (inner): XP segments ===
  const ring1SegAngle = (2 * Math.PI) / xpSegments.length;
  xpSegments.forEach((seg, i) => {
    const startAngle = i * ring1SegAngle + innerRotation;
    const endAngle = startAngle + ring1SegAngle;

    ctx.beginPath();
    ctx.arc(center, center, ring1Outer, startAngle, endAngle);
    ctx.arc(center, center, innerCenterRadius, endAngle, startAngle, true);
    ctx.closePath();

    const isBonusTrigger = seg.reward_type === 'nothing';
    const isUpgradeTrigger = seg.reward_type === 'upgrade';
    
    if (isBonusTrigger) {
      const grad = ctx.createRadialGradient(center, center, innerCenterRadius, center, center, ring1Outer);
      grad.addColorStop(0, '#C5A028');
      grad.addColorStop(1, '#8B6914');
      ctx.fillStyle = grad;
    } else if (isUpgradeTrigger) {
      const grad = ctx.createRadialGradient(center, center, innerCenterRadius, center, center, ring1Outer);
      grad.addColorStop(0, '#2E8B57');
      grad.addColorStop(1, '#1B5E3A');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = seg.color;
    }
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const midAngle = startAngle + ring1SegAngle / 2;
    const innerTextR = innerCenterRadius + (ring1Outer - innerCenterRadius) / 2;
    const tx = center + Math.cos(midAngle) * innerTextR;
    const ty = center + Math.sin(midAngle) * innerTextR;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 3;

    if (isBonusTrigger) {
      ctx.fillStyle = '#1a1a2e';
      ctx.font = `bold ${size < 400 ? 11 : 14}px sans-serif`;
      ctx.strokeStyle = 'rgba(212,175,55,0.5)';
      ctx.lineWidth = 2.5;
      ctx.strokeText('☥ بونص', tx, ty);
      ctx.fillText('☥ بونص', tx, ty);
    } else if (isUpgradeTrigger) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${size < 400 ? 11 : 14}px sans-serif`;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 2.5;
      ctx.strokeText('⬆ ترقية', tx, ty);
      ctx.fillText('⬆ ترقية', tx, ty);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${size < 400 ? 11 : 14}px sans-serif`;
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.lineWidth = 3;
      const maxW = (ring1Outer - innerCenterRadius) * 0.85;
      const txtLines = wrapText(ctx, seg.label, maxW);
      const lineH = size < 400 ? 12 : 15;
      const startTxtY = ty - ((txtLines.length - 1) * lineH) / 2;
      txtLines.forEach((line, li) => {
        ctx.strokeText(line, tx, startTxtY + li * lineH);
        ctx.fillText(line, tx, startTxtY + li * lineH);
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

  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 16px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
  ctx.shadowBlur = 6;
  ctx.fillText('𓂀', center, center);
  ctx.shadowBlur = 0;
};

/** Normalize angle to [0, 2π) */
const normalizeAngle = (a: number) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

const WheelOfFortune = () => {
  const { segments, settings, todaySpins, setTodaySpins, spinning, loading, canSpin, isFree, spinWheel, processBonusReward } = useWheelOfFortune();
  const { language, t, dir } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [upgradeRotation, setUpgradeRotation] = useState(0);
  const [outerRotation, setOuterRotation] = useState(0);
  const [innerRotation, setInnerRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isBonusAnimating, setIsBonusAnimating] = useState(false);
  const [isUpgradeAnimating, setIsUpgradeAnimating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [bonusResult, setBonusResult] = useState<string | null>(null);
  const [upgradeResult, setUpgradeResult] = useState<string | null>(null);
  const animRef = useRef<number>();
  const bonusAnimRef = useRef<number>();
  const upgradeAnimRef = useRef<number>();
  const [bonusSegments, setBonusSegments] = useState<BonusSegment[]>(FALLBACK_BONUS_SEGMENTS);
  const [upgradeSegments, setUpgradeSegments] = useState<UpgradeSegment[]>(FALLBACK_UPGRADE_SEGMENTS);
  const [lastSpinCost, setLastSpinCost] = useState(0);

  // Fetch outer + upgrade segments from DB
  useEffect(() => {
    supabase.from("wheel_outer_segments").select("*").eq("is_active", true).order("display_order")
      .then(({ data, error }) => {
        if (error) console.error("wheel_outer_segments error:", error);
        if (data && data.length > 0) {
          setBonusSegments(data.map((s: any) => ({
            label: s.label,
            label_en: s.label_en,
            value: Number(s.reward_value),
            probability: Number(s.probability ?? 0),
            color: s.color,
          })));
        }
      });
    supabase.from("wheel_upgrade_segments").select("*").eq("is_active", true).order("display_order")
      .then(({ data, error }) => {
        if (error) console.error("wheel_upgrade_segments error:", error);
        if (data && data.length > 0) {
          setUpgradeSegments(data.map((s: any) => ({
            label: s.label,
            label_en: s.label_en,
            value: Number(s.reward_value),
            probability: Number(s.probability ?? 0),
            color: s.color,
            reward_type: s.reward_type,
          })));
        }
      });
  }, []);

  const displaySegments = segments.map((segment) => ({
    ...segment,
    label: getLocalizedLabel(language, segment.label, segment.label_en ?? undefined),
  }));
  const displayBonusSegments = bonusSegments.map((segment) => ({
    ...segment,
    label: getLocalizedLabel(language, segment.label, segment.label_en),
  }));
  const displayUpgradeSegments = upgradeSegments.map((segment) => ({
    ...segment,
    label: getLocalizedLabel(language, segment.label, segment.label_en),
  }));
  const displayTitle = getLocalizedLabel(language, settings?.title ?? "", settings?.title_en ?? undefined);
  const displayDescription = getLocalizedLabel(language, settings?.description ?? "", settings?.description_en ?? undefined);
  const displayIntroText = getLocalizedLabel(language, settings?.intro_text ?? "", settings?.intro_text_en ?? undefined);

  // Draw combined wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displaySegments.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawTripleRingWheel(ctx, canvas, displaySegments, displayBonusSegments, displayUpgradeSegments, upgradeRotation, outerRotation, innerRotation);
  }, [displaySegments, displayBonusSegments, displayUpgradeSegments, upgradeRotation, outerRotation, innerRotation]);

  // Spin the UPGRADE ring (3rd ring) when "ترقية" triggered
  const spinUpgradeRing = useCallback(() => {
    setIsUpgradeAnimating(true);
    setUpgradeResult(null);

    // Weighted random
    const weights = upgradeSegments.map(s => 1 / (s.value + 0.1));
    const totalW = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalW;
    let winnerIdx = 0;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { winnerIdx = i; break; }
    }

    const winner = upgradeSegments[winnerIdx];
    const segAngle = (2 * Math.PI) / upgradeSegments.length;

    const desiredFinal = -Math.PI / 2 - winnerIdx * segAngle - segAngle / 2;
    const currentRot = upgradeRotation;
    let delta = desiredFinal - currentRot;
    delta = normalizeAngle(delta);
    const totalRot = delta + Math.PI * 2 * (6 + Math.floor(Math.random() * 3));

    const startTime = Date.now();
    const duration = 3500;
    const startRot = currentRot;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setUpgradeRotation(startRot + totalRot * ease);

      if (progress < 1) {
        upgradeAnimRef.current = requestAnimationFrame(animate);
      } else {
        setIsUpgradeAnimating(false);
        setUpgradeResult(`⬆ ${winner.label}`);
        
        // Process upgrade reward via bonus reward function
        processBonusReward(winner.value);
        
        toast.success(`⬆ مبروك! حصلت على ${winner.label}`, {
          description: `نوع الترقية: ${winner.reward_type} | القيمة: ${winner.value}`,
        });
      }
    };

    upgradeAnimRef.current = requestAnimationFrame(animate);
  }, [upgradeRotation, upgradeSegments, processBonusReward]);

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

    const winner = bonusSegments[winnerIdx];
    const segAngle = (2 * Math.PI) / bonusSegments.length;

    const desiredFinal = -Math.PI / 2 - winnerIdx * segAngle - segAngle / 2;
    const currentRot = outerRotation;
    let delta = desiredFinal - currentRot;
    delta = normalizeAngle(delta);
    const totalRot = delta + Math.PI * 2 * (6 + Math.floor(Math.random() * 3));

    const startTime = Date.now();
    const duration = 3500;
    const startRot = currentRot;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setOuterRotation(startRot + totalRot * ease);

      if (progress < 1) {
        bonusAnimRef.current = requestAnimationFrame(animate);
      } else {
        setIsBonusAnimating(false);
        const userAmount = (winner.value * 0.8).toFixed(2);
        const poolAmount = (winner.value * 0.2).toFixed(2);
        setBonusResult(`${userAmount} $MS-RA`);
        
        processBonusReward(winner.value);
        
        toast.success(`☥ مبروك! ربحت ${userAmount} $MS-RA`, {
          description: `إجمالي: ${winner.value} - حصتك: ${userAmount} (80%) | المجمع: ${poolAmount} (20%)`,
        });
      }
    };

    bonusAnimRef.current = requestAnimationFrame(animate);
  }, [outerRotation, bonusSegments, processBonusReward]);

  // Spin the INNER ring (XP)
  const handleSpin = async () => {
    if (isAnimating || isBonusAnimating || isUpgradeAnimating || !canSpin()) return;

    setResult(null);
    setBonusResult(null);
    setUpgradeResult(null);
    setIsAnimating(true);

    const costXp = isFree() ? 0 : (settings?.spin_cost_xp || 0);
    setLastSpinCost(costXp);

    const winner = await spinWheel();
    if (!winner) {
      setIsAnimating(false);
      return;
    }

    const winnerIndex = segments.findIndex((s) => s.id === winner.id);
    const segAngle = (2 * Math.PI) / segments.length;

    const desiredFinal = -Math.PI / 2 - winnerIndex * segAngle - segAngle / 2;
    const startRotation = innerRotation;
    let delta = desiredFinal - startRotation;
    delta = normalizeAngle(delta);
    const totalRotation = delta + Math.PI * 2 * (6 + Math.floor(Math.random() * 2));

    const startTime = Date.now();
    const duration = 4000;

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
          // Bonus → spin MS-RA ring (ring 2)
          setResult("☥ بونص! الحلقة الوسطى تدور...");
          if (costXp > 0) {
            toast("☥ بونص! تم تحويل " + costXp + " XP للمجمع", {
              description: "حلقة $MS-RA تدور الآن!",
            });
          } else {
            toast("☥ بونص! حلقة $MS-RA تدور الآن!");
          }
          setTimeout(() => spinBonusRing(), 800);
        } else if (winner.reward_type === "upgrade") {
          // Upgrade → spin upgrade ring (ring 3)
          setResult("⬆ ترقية! الحلقة الخارجية تدور...");
          toast("⬆ ترقية! حلقة الترقيات تدور الآن!");
          setTimeout(() => spinUpgradeRing(), 800);
        } else if (winner.reward_type === "free_spin") {
          const extraSpins = Math.floor(winner.reward_value);
          setResult(`🎰 ${extraSpins} لفات إضافية!`);
          setTodaySpins(prev => Math.max(0, prev - extraSpins));
          toast.success(`🎰 مبروك! حصلت على ${extraSpins} لفات إضافية مجانية!`);
        } else {
          const userAmount = (winner.reward_value * 0.8).toFixed(1);
          const poolAmount = (winner.reward_value * 0.2).toFixed(1);
          setResult(`${userAmount} ${winner.reward_type.toUpperCase()}`);
          toast.success(`🎉 مبروك! ربحت ${userAmount} ${winner.reward_type.toUpperCase()}`, {
            description: `إجمالي: ${winner.reward_value} - حصتك: ${userAmount} (80%) | المجمع: ${poolAmount} (20%)`,
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
      if (upgradeAnimRef.current) cancelAnimationFrame(upgradeAnimRef.current);
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

  const anyAnimating = isAnimating || isBonusAnimating || isUpgradeAnimating;

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
        {/* Triple-ring wheel */}
        <div className="relative">
          {/* Pointer at top */}
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
              const r = 190;
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
            width={560}
            height={560}
            className="rounded-full shadow-2xl shadow-amber-500/20 border-[3px] border-amber-500/50 w-full"
            style={{ maxWidth: '95vw', aspectRatio: '1/1' }}
          />

          {isBonusAnimating && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-amber-500/20 backdrop-blur-sm rounded-full px-3 py-1 animate-pulse">
                <span className="text-amber-400 text-[10px] font-bold">$MS-RA 🎰</span>
              </div>
            </div>
          )}

          {isUpgradeAnimating && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-emerald-500/20 backdrop-blur-sm rounded-full px-3 py-1 animate-pulse">
                <span className="text-emerald-400 text-[10px] font-bold">⬆ ترقية 🎰</span>
              </div>
            </div>
          )}
        </div>

        {/* Ring labels */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[9px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-500/60 arabic-text">الخارجية: ترقيات</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-500/60 arabic-text" dir="ltr">الوسطى: $MS-RA</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-700" />
            <span className="text-amber-500/60 arabic-text">الداخلية: XP</span>
          </div>
        </div>

        {/* Distribution info */}
        <div className="text-[9px] text-amber-500/40 text-center arabic-text">
          ⚖️ التوزيع: 80% للمحفظة | 20% لمجمع السيولة
        </div>

        {/* Results */}
        {result && !isBonusAnimating && !isUpgradeAnimating && (
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
              <p className="text-amber-500/70 text-xs arabic-text">80% لمحفظتك | 20% لمجمع السيولة</p>
            </div>
          </div>
        )}

        {upgradeResult && (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
              <p className="text-emerald-400 font-bold text-lg">{upgradeResult}</p>
              <p className="text-emerald-500/70 text-xs arabic-text">تم تطبيق الترقية على حسابك</p>
            </div>
          </div>
        )}

        {/* Spin Button & Info */}
        <div className="text-center space-y-2 w-full">
          <Button
            onClick={handleSpin}
            disabled={anyAnimating || !canSpin()}
            size="lg"
            className="w-full max-w-[220px] gap-2 font-bold bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-600 hover:to-amber-400 text-black border border-amber-400/30"
          >
            {anyAnimating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="arabic-text">
                  {isUpgradeAnimating ? 'حلقة الترقية تدور...' : isBonusAnimating ? 'حلقة $MS-RA تدور...' : 'جاري التدوير...'}
                </span>
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
