import { useState, useRef, useEffect, useCallback } from "react";
import { useWheelOfFortune } from "@/hooks/useWheelOfFortune";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUICardSettings } from "@/hooks/useUICardSettings";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Gift } from "lucide-react";
import { toast } from "sonner";
import wheelBgDefault from "@/assets/wheel-bg.jpg";

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
  { label: '5 EGP', label_en: '5 EGP', value: 5, probability: 2, color: '#2E8B57', reward_type: 'egp' },
  { label: '10 EGP', label_en: '10 EGP', value: 10, probability: 1.5, color: '#1a1a2e', reward_type: 'egp' },
  { label: '20 EGP', label_en: '20 EGP', value: 20, probability: 1, color: '#228B22', reward_type: 'egp' },
  { label: '50 EGP', label_en: '50 EGP', value: 50, probability: 0.5, color: '#2d2d44', reward_type: 'egp' },
  { label: '1 EGP', label_en: '1 EGP', value: 1, probability: 3, color: '#3CB371', reward_type: 'egp' },
  { label: '100 EGP', label_en: '100 EGP', value: 100, probability: 0.3, color: '#0d0d1a', reward_type: 'egp' },
  { label: '2 EGP', label_en: '2 EGP', value: 2, probability: 2.5, color: '#32CD32', reward_type: 'egp' },
  { label: '25 EGP', label_en: '25 EGP', value: 25, probability: 0.8, color: '#1f1f35', reward_type: 'egp' },
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

/** Strip unit suffixes so only the numeric value appears on wheel segments */
const stripUnit = (label: string): string => {
  return label
    .replace(/\$?\s*MS[\s-]?RA/gi, '')
    .replace(/\$?\s*MSRA/gi, '')
    .replace(/\bXP\b/gi, '')
    .replace(/\bxp\b/gi, '')
    .replace(/L\.?\s*E\.?/gi, '')
    .replace(/\bLE\b/gi, '')
    .replace(/نقاط/gi, '')
    .replace(/نقطة/gi, '')
    .replace(/جنيه/gi, '')
    .replace(/عملة/gi, '')
    .replace(/توكن/gi, '')
    .replace(/token[s]?/gi, '')
    .replace(/point[s]?/gi, '')
    .replace(/coin[s]?/gi, '')
    .replace(/\$/g, '')
    .replace(/^\s+|\s+$/g, '')
    .trim();
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

  const ws = (window as any).__wheelSettings || {};
  const outerEdge = center - 14;
  const outerRatio = ws.ring_outer_ratio ?? 0.74;
  const middleRatio = ws.ring_middle_ratio ?? 0.50;
  const innerRatio = ws.ring_inner_ratio ?? 0.48;
  const segFontSize = ws.segment_font_size ?? '15px';
  const segFontFamily = ws.segment_font_family ?? 'sans-serif';
  const dividerColor = ws.divider_color ?? '#D4AF37';
  const outerStroke = ws.outer_ring_stroke_color ?? '#2E8B57';
  const middleStroke = ws.middle_ring_stroke_color ?? '#D4AF37';
  const innerStroke = ws.inner_ring_stroke_color ?? 'rgba(212,175,55,0.6)';
  const centerBg = ws.center_bg_color ?? '#D4AF37';
  const centerTextColor = ws.center_text_color ?? '#1a1a2e';
  const centerIcon = ws.center_icon ?? '𓂀';
  const centerSize = ws.center_size ?? 28;
  const wheelBorderColor = ws.wheel_border_color ?? '#D4AF37';

  const ring3Outer = outerEdge;
  const ring3Inner = outerEdge * outerRatio;
  const divider2 = outerEdge * (outerRatio - 0.01);
  const ring2Outer = outerEdge * (outerRatio - 0.02);
  const ring2Inner = outerEdge * middleRatio;
  const divider1 = outerEdge * (middleRatio - 0.01);
  const ring1Outer = outerEdge * innerRatio;
  const innerCenterRadius = centerSize;

  ctx.clearRect(0, 0, size, size);

  // === Background image ===
  if (ws.bgImage && ws.bgImage.complete) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, outerEdge + 5, 0, 2 * Math.PI);
    ctx.clip();
    ctx.globalAlpha = 0.15;
    ctx.drawImage(ws.bgImage, 0, 0, size, size);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // === Outer decorative ring with Egyptian symbols ===
  ctx.beginPath();
  ctx.arc(center, center, outerEdge + 10, 0, 2 * Math.PI);
  ctx.strokeStyle = wheelBorderColor;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Egyptian hieroglyph border - larger symbols
  const borderSymbols = ['☥', '𓂀', '𓆣', '𓊽', '𓌀', '𓁢', '𓅃', '☥', '𓂀', '𓆣', '𓊽', '𓌀', '𓁢', '𓅃', '☥', '𓆣'];
  for (let i = 0; i < borderSymbols.length; i++) {
    const angle = (i / borderSymbols.length) * Math.PI * 2 - Math.PI / 2;
    const x = center + Math.cos(angle) * (outerEdge + 10);
    const y = center + Math.sin(angle) * (outerEdge + 10);
    ctx.save();
    ctx.fillStyle = i % 2 === 0 ? wheelBorderColor : '#B8860B';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(212,175,55,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(borderSymbols[i], x, y);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Small decorative dots between symbols
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    const x = center + Math.cos(angle) * (outerEdge + 3);
    const y = center + Math.sin(angle) * (outerEdge + 3);
    ctx.fillStyle = wheelBorderColor;
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // === RING 3 (outermost): EGP rewards - ONE scarab segment = x2 ===
  const ring3SegAngle = (2 * Math.PI) / upgradeSegments.length;
  const ring3ScarabIdx = 0; // First segment is the x2 scarab
  upgradeSegments.forEach((seg, i) => {
    const startAngle = i * ring3SegAngle + upgradeRotation;
    const endAngle = startAngle + ring3SegAngle;

    ctx.beginPath();
    ctx.arc(center, center, ring3Outer, startAngle, endAngle);
    ctx.arc(center, center, ring3Inner, endAngle, startAngle, true);
    ctx.closePath();

    const isScarab = i === ring3ScarabIdx;
    if (isScarab) {
      const grad = ctx.createRadialGradient(center, center, ring3Inner, center, center, ring3Outer);
      grad.addColorStop(0, '#2E8B57');
      grad.addColorStop(1, '#1B5E3A');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = seg.color;
    }
    ctx.fill();
    ctx.strokeStyle = outerStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const midAngle = startAngle + ring3SegAngle / 2;
    const textR = ring3Inner + (ring3Outer - ring3Inner) / 2;
    const tx = center + Math.cos(midAngle) * textR;
    const ty = center + Math.sin(midAngle) * textR;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'ltr';
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(0,0,0,0.9)';
    ctx.lineWidth = 3.5;

    if (isScarab) {
      // Large scarab symbol only
      const scarabSize = Math.max(26, Math.round((ring3Outer - ring3Inner) * 0.6));
      ctx.font = `bold ${scarabSize}px serif`;
      ctx.fillStyle = '#FFD700';
      ctx.strokeText('𓆣', tx, ty);
      ctx.fillText('𓆣', tx, ty);
    } else {
      // Normal EGP segment - number + EGP only
      const cleanLabel = stripUnit(seg.label);
      const numFontSize = Math.max(13, parseInt(segFontSize) || 15);
      ctx.font = `bold ${numFontSize}px ${segFontFamily}`;
      ctx.fillStyle = '#ffffff';
      ctx.strokeText(cleanLabel, tx, ty - 4);
      ctx.fillText(cleanLabel, tx, ty - 4);
      ctx.font = `bold ${Math.max(9, numFontSize - 3)}px ${segFontFamily}`;
      ctx.fillStyle = '#90EE90';
      ctx.strokeText('EGP', tx, ty + numFontSize - 2);
      ctx.fillText('EGP', tx, ty + numFontSize - 2);
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  });

  // === Divider 2 ===
  ctx.beginPath();
  ctx.arc(center, center, divider2, 0, 2 * Math.PI);
  ctx.strokeStyle = dividerColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // === RING 2 (middle): $MS-RA tokens - ONE scarab for transition ===
  const ring2SegAngle = (2 * Math.PI) / msraSegments.length;
  // Find the upgrade trigger segment, or use last index as scarab
  const ring2ScarabIdx = msraSegments.findIndex((s) => isUpgradeTriggerSegment(s as any));
  const actualRing2Scarab = ring2ScarabIdx >= 0 ? ring2ScarabIdx : msraSegments.length - 1;
  msraSegments.forEach((seg, i) => {
    const startAngle = i * ring2SegAngle + outerRotation;
    const endAngle = startAngle + ring2SegAngle;

    ctx.beginPath();
    ctx.arc(center, center, ring2Outer, startAngle, endAngle);
    ctx.arc(center, center, ring2Inner, endAngle, startAngle, true);
    ctx.closePath();

    const isScarab = i === actualRing2Scarab;
    if (isScarab) {
      const grad = ctx.createRadialGradient(center, center, ring2Inner, center, center, ring2Outer);
      grad.addColorStop(0, '#C5A028');
      grad.addColorStop(1, '#8B6914');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = seg.color;
    }
    ctx.fill();
    ctx.strokeStyle = middleStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const midAngle = startAngle + ring2SegAngle / 2;
    const textR = ring2Inner + (ring2Outer - ring2Inner) / 2;
    const tx = center + Math.cos(midAngle) * textR;
    const ty = center + Math.sin(midAngle) * textR;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'ltr';
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(0,0,0,0.9)';
    ctx.lineWidth = 3.5;

    if (isScarab) {
      // Large scarab only
      const scarabSize = Math.max(24, Math.round((ring2Outer - ring2Inner) * 0.55));
      ctx.font = `bold ${scarabSize}px serif`;
      ctx.fillStyle = '#FFD700';
      ctx.strokeText('𓆣', tx, ty);
      ctx.fillText('𓆣', tx, ty);
    } else {
      // Normal $MS-RA segment - number + currency only
      const cleanLabel = stripUnit(seg.label);
      const numFontSize = Math.max(12, parseInt(segFontSize) || 14);
      ctx.font = `bold ${numFontSize}px ${segFontFamily}`;
      ctx.fillStyle = '#ffffff';
      ctx.strokeText(cleanLabel, tx, ty - 4);
      ctx.fillText(cleanLabel, tx, ty - 4);
      ctx.font = `bold ${Math.max(8, numFontSize - 4)}px ${segFontFamily}`;
      ctx.fillStyle = '#FFD700';
      ctx.strokeText('$MS-RA', tx, ty + numFontSize - 2);
      ctx.fillText('$MS-RA', tx, ty + numFontSize - 2);
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  });

  // === Divider 1 with Egyptian ankh symbols ===
  ctx.beginPath();
  ctx.arc(center, center, divider1, 0, 2 * Math.PI);
  ctx.strokeStyle = dividerColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = center + Math.cos(angle) * divider1;
    const y = center + Math.sin(angle) * divider1;
    ctx.fillStyle = dividerColor;
    ctx.font = 'bold 11px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(212,175,55,0.4)';
    ctx.shadowBlur = 3;
    ctx.fillText('☥', x, y);
    ctx.shadowBlur = 0;
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
    ctx.strokeStyle = innerStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const midAngle = startAngle + ring1SegAngle / 2;
    const innerTextR = innerCenterRadius + (ring1Outer - innerCenterRadius) / 2;
    const tx = center + Math.cos(midAngle) * innerTextR;
    const ty = center + Math.sin(midAngle) * innerTextR;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'ltr';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 4;

    if (isBonusTrigger) {
      // Bonus trigger - scarab only
      const scarabSize = Math.max(22, Math.round(innerCenterRadius * 0.85));
      ctx.font = `bold ${scarabSize}px serif`;
      ctx.strokeStyle = 'rgba(0,0,0,0.9)';
      ctx.lineWidth = 3.5;
      ctx.fillStyle = '#FFD700';
      ctx.strokeText('𓆣', tx, ty);
      ctx.fillText('𓆣', tx, ty);
    } else if (isUpgradeTrigger) {
      // Upgrade trigger - Was scepter (transition to EGP ring)
      const scepterSize = Math.round(innerCenterRadius * 0.7);
      ctx.font = `bold ${scepterSize}px serif`;
      ctx.strokeStyle = 'rgba(0,0,0,0.9)';
      ctx.lineWidth = 3.5;
      ctx.fillStyle = '#90EE90';
      const line1Y = ty - scepterSize * 0.3;
      ctx.strokeText('𓌀', tx, line1Y);
      ctx.fillText('𓌀', tx, line1Y);
      const upgFontSize = Math.max(11, (parseInt(segFontSize) || 15) - 2);
      ctx.font = `bold ${upgFontSize - 1}px ${segFontFamily}`;
      const line2Y = ty + scepterSize * 0.4;
      ctx.strokeText('→ EGP', tx, line2Y);
      ctx.fillText('→ EGP', tx, line2Y);
    } else {
      // Normal XP segment - number + XP only (NO scarab)
      const numFontSize = Math.max(12, parseInt(segFontSize) || 14);
      ctx.font = `bold ${numFontSize}px ${segFontFamily}`;
      ctx.strokeStyle = 'rgba(0,0,0,0.9)';
      ctx.lineWidth = 3.5;
      ctx.fillStyle = '#ffffff';
      const cleanLabel = stripUnit(seg.label);
      ctx.strokeText(cleanLabel, tx, ty - 4);
      ctx.fillText(cleanLabel, tx, ty - 4);
      ctx.font = `bold ${Math.max(8, numFontSize - 4)}px ${segFontFamily}`;
      ctx.fillStyle = '#FFD700';
      ctx.strokeText('XP', tx, ty + numFontSize - 2);
      ctx.fillText('XP', tx, ty + numFontSize - 2);
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  });

  // === Center circle ===
  const centerGrad = ctx.createRadialGradient(center, center, 0, center, center, innerCenterRadius);
  centerGrad.addColorStop(0, centerBg);
  centerGrad.addColorStop(0.7, centerBg);
  centerGrad.addColorStop(1, `${centerBg}88`);
  ctx.beginPath();
  ctx.arc(center, center, innerCenterRadius, 0, 2 * Math.PI);
  ctx.fillStyle = centerGrad;
  ctx.fill();
  ctx.strokeStyle = dividerColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = centerTextColor;
  ctx.font = `bold ${Math.round(innerCenterRadius * 0.8)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = `${centerBg}80`;
  ctx.shadowBlur = 8;
  ctx.fillText(centerIcon, center, center);
  ctx.shadowBlur = 0;
};

/** Normalize angle to [0, 2π) */
const normalizeAngle = (a: number) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

const WheelOfFortune = () => {
  const { segments, settings, todaySpins, setTodaySpins, spinning, loading, canSpin, isFree, spinWheel, processBonusReward } = useWheelOfFortune();
  const { language, t, dir } = useLanguage();
  const { getCardStyle, getCardSetting } = useUICardSettings();
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
  const displayNoteText = getLocalizedLabel(language, (settings as any)?.note_text ?? "", (settings as any)?.note_text_en ?? undefined);

  // Set all settings as globals for canvas drawing
  useEffect(() => {
    if (settings) {
      const ws: Record<string, any> = {
        ring_outer_ratio: settings.ring_outer_ratio ?? 0.74,
        ring_middle_ratio: settings.ring_middle_ratio ?? 0.50,
        ring_inner_ratio: settings.ring_inner_ratio ?? 0.48,
        segment_font_size: settings.segment_font_size ?? '15px',
        segment_font_family: settings.segment_font_family ?? 'sans-serif',
        divider_color: settings.divider_color ?? '#D4AF37',
        outer_ring_stroke_color: settings.outer_ring_stroke_color ?? '#2E8B57',
        middle_ring_stroke_color: settings.middle_ring_stroke_color ?? '#D4AF37',
        inner_ring_stroke_color: settings.inner_ring_stroke_color ?? 'rgba(212,175,55,0.6)',
        center_bg_color: settings.center_bg_color ?? '#D4AF37',
        center_text_color: settings.center_text_color ?? '#1a1a2e',
        center_icon: settings.center_icon ?? '𓂀',
        center_size: settings.center_size ?? 28,
        wheel_border_color: settings.wheel_border_color ?? '#D4AF37',
      };

      // Load background image - use uploaded default or admin setting
      const bgSrc = settings.wheel_background_image || wheelBgDefault;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ws.bgImage = img;
        (window as any).__wheelSettings = ws;
      };
      img.src = bgSrc;

      (window as any).__wheelSettings = ws;
    }
  }, [settings]);

  // Draw combined wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displaySegments.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawTripleRingWheel(ctx, canvas, displaySegments, displayBonusSegments, displayUpgradeSegments, upgradeRotation, outerRotation, innerRotation);
  }, [displaySegments, displayBonusSegments, displayUpgradeSegments, upgradeRotation, outerRotation, innerRotation, settings]);

  // Spin the UPGRADE ring (3rd ring) when triggered
  const spinUpgradeRing = useCallback(() => {
    setIsUpgradeAnimating(true);
    setUpgradeResult(null);

    const winnerIdx = pickWeightedIndex(upgradeSegments);
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
        setUpgradeResult(`⬆ ${getLocalizedLabel(language, winner.label, winner.label_en)}`);
        processBonusReward(winner.value);
        toast.success(`⬆ ${t("تم التحديث")}: ${getLocalizedLabel(language, winner.label, winner.label_en)}`);
      }
    };

    upgradeAnimRef.current = requestAnimationFrame(animate);
  }, [upgradeRotation, upgradeSegments, processBonusReward, language, t]);

  // Spin the OUTER ring ($MS-RA) when bonus triggered
  const spinBonusRing = useCallback(() => {
    setIsBonusAnimating(true);
    setBonusResult(null);

    const winnerIdx = pickWeightedIndex(bonusSegments);
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

        if (isUpgradeTriggerSegment(winner)) {
          setResult(`⬆ ${t("تم التحديث")}`);
          toast.success(`⬆ ${t("عجلة الحظ")}: ${getLocalizedLabel(language, winner.label, winner.label_en)}`);
          setTimeout(() => spinUpgradeRing(), 700);
          return;
        }

        const userAmount = (winner.value * 0.8).toFixed(2);
        const poolAmount = (winner.value * 0.2).toFixed(2);
        setBonusResult(`${userAmount} $MS-RA`);
        processBonusReward(winner.value);
        toast.success(`☥ ${t("تم التحديث")}: ${userAmount} $MS-RA`, {
          description: `${poolAmount} $MS-RA → Pool`,
        });
      }
    };

    bonusAnimRef.current = requestAnimationFrame(animate);
  }, [outerRotation, bonusSegments, processBonusReward, spinUpgradeRing, language, t]);

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
          setResult(language === "ar" || language === "both" ? "☥ بونص! الحلقة الوسطى تدور..." : "☥ Bonus! The middle ring is spinning...");
          setTimeout(() => spinBonusRing(), 800);
        } else if (winner.reward_type === "upgrade") {
          setResult(language === "ar" || language === "both" ? "⬆ EGP! الحلقة الخارجية تدور..." : "⬆ EGP! The outer ring is spinning...");
          setTimeout(() => spinUpgradeRing(), 800);
        } else if (winner.reward_type === "free_spin") {
          const extraSpins = Math.floor(winner.reward_value);
          setResult(`🎰 ${extraSpins} ${language === "ar" || language === "both" ? "لفات إضافية!" : "extra spins!"}`);
          setTodaySpins(prev => Math.max(0, prev - extraSpins));
          toast.success(`🎰 ${language === "ar" || language === "both" ? `مبروك! حصلت على ${extraSpins} لفات إضافية مجانية!` : `You got ${extraSpins} free extra spins!`}`);
        } else {
          const userAmount = (winner.reward_value * 0.8).toFixed(1);
          const poolAmount = (winner.reward_value * 0.2).toFixed(1);
          setResult(`${userAmount} ${winner.reward_type.toUpperCase()}`);
          toast.success(`🎉 ${language === "ar" || language === "both" ? `مبروك! ربحت ${userAmount} ${winner.reward_type.toUpperCase()}` : `You won ${userAmount} ${winner.reward_type.toUpperCase()}`}`, {
            description: language === "ar" || language === "both" ? `إجمالي: ${winner.reward_value} - حصتك: ${userAmount} (80%) | المجمع: ${poolAmount} (20%)` : `Total: ${winner.reward_value} - Yours: ${userAmount} (80%) | Pool: ${poolAmount} (20%)`,
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
  const wheelCardSetting = getCardSetting('wheel_of_fortune');
  const hasWheelCustom = wheelCardSetting?.background_image || wheelCardSetting?.background_gradient || wheelCardSetting?.background_color;
  const wheelCardStyle = hasWheelCustom ? getCardStyle('wheel_of_fortune') : {};

  return (
    <Card className="border-amber-500/40 bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] overflow-hidden relative" style={wheelCardStyle}>
      {wheelCardSetting?.background_image && (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: `rgba(0,0,0,${wheelCardSetting.overlay_opacity || 0.6})` }} />
      )}
      <div className="absolute top-3 left-4 text-amber-500/50 text-2xl select-none drop-shadow-[0_0_4px_rgba(212,175,55,0.3)]">𓅃</div>
      <div className="absolute top-3 right-4 text-amber-500/50 text-2xl select-none drop-shadow-[0_0_4px_rgba(212,175,55,0.3)]">𓁢</div>
      <div className="absolute bottom-3 left-4 text-amber-500/50 text-2xl select-none drop-shadow-[0_0_4px_rgba(212,175,55,0.3)]">𓆣</div>
      <div className="absolute bottom-3 right-4 text-amber-500/50 text-2xl select-none drop-shadow-[0_0_4px_rgba(212,175,55,0.3)]">𓌀</div>
      {/* Mid-side decorations */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2 text-amber-500/30 text-xl select-none">☥</div>
      <div className="absolute top-1/2 -translate-y-1/2 right-2 text-amber-500/30 text-xl select-none">☥</div>

      <CardHeader className="text-center pb-3 pt-5" dir={dir}>
        <CardTitle className="flex items-center justify-center gap-3 text-xl text-amber-400 arabic-text font-bold tracking-wide">
          <span className="text-2xl">☥</span>
          {displayTitle}
          <span className="text-2xl">☥</span>
        </CardTitle>
        {displayDescription && (
          <div className="mt-3 mx-auto max-w-sm">
            <p className="text-sm text-amber-200/80 arabic-text whitespace-pre-line leading-relaxed text-center font-medium">{displayDescription}</p>
          </div>
        )}
        {displayIntroText && (
          <div className="mt-2 mx-auto max-w-md border border-amber-500/20 rounded-lg px-4 py-2 bg-amber-500/5">
            <p className="text-xs text-amber-400/70 arabic-text whitespace-pre-line leading-relaxed text-center">{displayIntroText}</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4 px-2 pb-6 sm:px-6">
        {/* Triple-ring wheel */}
        <div className="relative w-[calc(100vw-1rem)] max-w-[40rem]">
          {/* Pointer at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
            <div className="relative">
              <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent drop-shadow-lg" style={{ borderTopColor: settings?.pointer_color || '#f59e0b' }} />
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[19px] border-l-transparent border-r-transparent absolute top-[1px] left-1/2 -translate-x-1/2" style={{ borderTopColor: `${settings?.pointer_color || '#f59e0b'}cc` }} />
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={640}
            height={640}
            className="rounded-full shadow-2xl shadow-amber-500/20 w-full"
            style={{ maxWidth: '100%', aspectRatio: '1/1', borderWidth: `${settings?.wheel_border_width ?? 3}px`, borderStyle: 'solid', borderColor: `${settings?.wheel_border_color || '#D4AF37'}80` }}
          />

          {isBonusAnimating && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-amber-500/20 backdrop-blur-sm rounded-full px-4 py-1.5 animate-pulse">
                <span className="text-amber-400 text-xs font-bold">☥ $MS-RA 🎰</span>
              </div>
            </div>
          )}

          {isUpgradeAnimating && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-emerald-500/20 backdrop-blur-sm rounded-full px-4 py-1.5 animate-pulse">
                <span className="text-emerald-400 text-xs font-bold">𓆣 EGP ×2 🎰</span>
              </div>
            </div>
          )}
        </div>

        {/* Ring labels */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px]" dir={dir}>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-emerald-400/70 arabic-text font-medium">{language === "ar" || language === "both" ? "الخارجية: EGP 𓆣×2" : "Outer: EGP 𓆣×2"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            <span className="text-amber-400/70 arabic-text font-medium" dir="ltr">{language === "ar" || language === "both" ? "الوسطى: $MS-RA" : "Middle: $MS-RA"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-700 shadow-sm shadow-amber-700/50" />
            <span className="text-amber-600/70 arabic-text font-medium">{language === "ar" || language === "both" ? "الداخلية: XP" : "Inner: XP"}</span>
          </div>
        </div>

        <div className="text-[10px] text-amber-500/50 text-center arabic-text font-medium" dir={dir}>
          {language === "ar" || language === "both" ? "⚖️ التوزيع: 80% للمحفظة | 20% لمجمع السيولة" : "⚖️ Distribution: 80% to wallet | 20% to liquidity pool"}
        </div>

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
              <p className="text-amber-500/70 text-xs arabic-text">{language === "ar" || language === "both" ? "80% لمحفظتك | 20% لمجمع السيولة" : "80% to your wallet | 20% to liquidity pool"}</p>
            </div>
          </div>
        )}

        {upgradeResult && (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
              <p className="text-emerald-400 font-bold text-lg">{upgradeResult}</p>
              <p className="text-emerald-500/70 text-xs arabic-text">{language === "ar" || language === "both" ? "𓆣 مكسب مضاعف ×2 على حسابك" : "𓆣 Double reward ×2 applied"}</p>
            </div>
          </div>
        )}

        <div className="text-center space-y-2 w-full" dir={dir}>
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
                  {isUpgradeAnimating ? (language === "ar" || language === "both" ? 'حلقة EGP تدور...' : 'EGP ring spinning...') : isBonusAnimating ? (language === "ar" || language === "both" ? 'حلقة $MS-RA تدور...' : '$MS-RA ring spinning...') : (language === "ar" || language === "both" ? 'جاري التدوير...' : 'Spinning...')}
                </span>
              </>
            ) : (
              <>
                <span>☥</span>
                <span className="arabic-text">{isFree() ? (language === "ar" || language === "both" ? "لف مجاناً!" : "Spin for free!") : (language === "ar" || language === "both" ? `لف (${settings?.spin_cost_xp} XP)` : `Spin (${settings?.spin_cost_xp} XP)`)}</span>
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-3 text-[11px] text-amber-500/60">
            <span className="text-base">𓆣</span>
            <span className="arabic-text">{language === "ar" || language === "both" ? `لفات اليوم: ${todaySpins} / ${settings?.free_spins_per_day || 0} مجانية` : `Today's spins: ${todaySpins} / ${settings?.free_spins_per_day || 0} free`}</span>
            <span className="text-base">𓆣</span>
          </div>
        </div>

        {/* Note / Comment space below the wheel */}
        {displayNoteText && (
          <div className="w-full mt-2 border-t border-amber-500/15 pt-3">
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg px-4 py-3 text-center">
              <p className="text-xs text-amber-400/60 arabic-text whitespace-pre-line leading-relaxed">{displayNoteText}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WheelOfFortune;
