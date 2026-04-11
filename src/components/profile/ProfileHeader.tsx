import { useState } from 'react';
import { useUICardSettings } from '@/hooks/useUICardSettings';
import { Camera, Trash2, User, BadgeCheck, ShieldCheck, Calendar, Star, Heart, MapPin, Briefcase, Eye, EyeOff, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useProfile, type Profile } from '@/hooks/useProfile';
import { FollowButton } from './FollowButton';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfileCustomization } from '@/hooks/useProfileCustomization';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const countryFlags: Record<string, string> = {
  EG: '🇪🇬', SA: '🇸🇦', AE: '🇦🇪', KW: '🇰🇼', QA: '🇶🇦', BH: '🇧🇭', OM: '🇴🇲',
  IQ: '🇮🇶', JO: '🇯🇴', LB: '🇱🇧', PS: '🇵🇸', SY: '🇸🇾', YE: '🇾🇪', LY: '🇱🇾',
  TN: '🇹🇳', DZ: '🇩🇿', MA: '🇲🇦', SD: '🇸🇩', SO: '🇸🇴', MR: '🇲🇷', DJ: '🇩🇯',
  KM: '🇰🇲', US: '🇺🇸', GB: '🇬🇧', FR: '🇫🇷', DE: '🇩🇪', TR: '🇹🇷', RU: '🇷🇺',
  IN: '🇮🇳', CN: '🇨🇳', JP: '🇯🇵', KR: '🇰🇷', BR: '🇧🇷', PK: '🇵🇰', BD: '🇧🇩',
  ID: '🇮🇩', NG: '🇳🇬', MX: '🇲🇽', PH: '🇵🇭', MY: '🇲🇾',
};

const countryNames: Record<string, { ar: string; en: string }> = {
  EG: { ar: 'مصر', en: 'Egypt' }, SA: { ar: 'السعودية', en: 'Saudi Arabia' },
  AE: { ar: 'الإمارات', en: 'UAE' }, KW: { ar: 'الكويت', en: 'Kuwait' },
  QA: { ar: 'قطر', en: 'Qatar' }, BH: { ar: 'البحرين', en: 'Bahrain' },
  OM: { ar: 'عُمان', en: 'Oman' }, IQ: { ar: 'العراق', en: 'Iraq' },
  JO: { ar: 'الأردن', en: 'Jordan' }, LB: { ar: 'لبنان', en: 'Lebanon' },
  PS: { ar: 'فلسطين', en: 'Palestine' }, SY: { ar: 'سوريا', en: 'Syria' },
  YE: { ar: 'اليمن', en: 'Yemen' }, LY: { ar: 'ليبيا', en: 'Libya' },
  TN: { ar: 'تونس', en: 'Tunisia' }, DZ: { ar: 'الجزائر', en: 'Algeria' },
  MA: { ar: 'المغرب', en: 'Morocco' }, SD: { ar: 'السودان', en: 'Sudan' },
  SO: { ar: 'الصومال', en: 'Somalia' }, MR: { ar: 'موريتانيا', en: 'Mauritania' },
  DJ: { ar: 'جيبوتي', en: 'Djibouti' }, KM: { ar: 'جزر القمر', en: 'Comoros' },
  US: { ar: 'أمريكا', en: 'USA' }, GB: { ar: 'بريطانيا', en: 'UK' },
  FR: { ar: 'فرنسا', en: 'France' }, DE: { ar: 'ألمانيا', en: 'Germany' },
  TR: { ar: 'تركيا', en: 'Turkey' }, RU: { ar: 'روسيا', en: 'Russia' },
  IN: { ar: 'الهند', en: 'India' }, CN: { ar: 'الصين', en: 'China' },
  JP: { ar: 'اليابان', en: 'Japan' }, KR: { ar: 'كوريا', en: 'Korea' },
  BR: { ar: 'البرازيل', en: 'Brazil' }, PK: { ar: 'باكستان', en: 'Pakistan' },
  BD: { ar: 'بنغلاديش', en: 'Bangladesh' }, ID: { ar: 'إندونيسيا', en: 'Indonesia' },
  NG: { ar: 'نيجيريا', en: 'Nigeria' }, MX: { ar: 'المكسيك', en: 'Mexico' },
  PH: { ar: 'الفلبين', en: 'Philippines' }, MY: { ar: 'ماليزيا', en: 'Malaysia' },
};

const maritalStatusLabels: Record<string, { ar: string; en: string }> = {
  single: { ar: 'أعزب', en: 'Single' },
  married: { ar: 'متزوج', en: 'Married' },
  divorced: { ar: 'مطلق', en: 'Divorced' },
  widowed: { ar: 'أرمل', en: 'Widowed' },
};

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(dateStr: string, isArabic: boolean): string {
  return new Date(dateStr).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

interface VisibleFields {
  email: boolean;
  phone: boolean;
  country: boolean;
  age: boolean;
  date_of_birth: boolean;
  marital_status: boolean;
  job_title: boolean;
  join_date: boolean;
  bio: boolean;
}

const DEFAULT_VISIBLE: VisibleFields = {
  email: true, phone: true, country: true, age: true,
  date_of_birth: true, marital_status: true, job_title: true,
  join_date: true, bio: true,
};

const fieldLabels: Record<keyof VisibleFields, { ar: string; en: string }> = {
  email: { ar: 'البريد', en: 'Email' },
  phone: { ar: 'الهاتف', en: 'Phone' },
  country: { ar: 'الدولة', en: 'Country' },
  age: { ar: 'العمر', en: 'Age' },
  date_of_birth: { ar: 'تاريخ الميلاد', en: 'Birthday' },
  marital_status: { ar: 'الحالة', en: 'Status' },
  job_title: { ar: 'الوظيفة', en: 'Job' },
  join_date: { ar: 'تاريخ الانضمام', en: 'Joined' },
  bio: { ar: 'النبذة', en: 'Bio' },
};

interface ProfileHeaderProps {
  profile: Profile;
  badges?: any[];
  isKycVerified?: boolean;
}

export function ProfileHeader({ profile, badges = [], isKycVerified = false }: ProfileHeaderProps) {
  const { uploadAvatar, deleteAvatar, uploading } = useProfile();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { customization } = useProfileCustomization();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showVisibilityEditor, setShowVisibilityEditor] = useState(false);
  const [visibleFields, setVisibleFields] = useState<VisibleFields>(() => {
    const raw = (customization as any)?.visible_fields;
    return { ...DEFAULT_VISIBLE, ...(raw || {}) };
  });
  
  const isOwnProfile = user?.id === profile.user_id;
  const isArabic = language === 'ar' || language === 'both';
  const { getCardStyle, getCardSetting } = useUICardSettings();
  const setting = getCardSetting('profile_header');
  const hasCustom = setting?.background_image || setting?.background_gradient || setting?.background_color;
  const cardStyle = hasCustom ? getCardStyle('profile_header') : {};

  // For other users viewing, use their visibility settings
  const vf = isOwnProfile ? visibleFields : visibleFields;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert(t('يرجى اختيار ملف صورة صالح', 'Please select a valid image file')); return; }
    if (file.size > 5 * 1024 * 1024) { alert(t('حجم الملف يجب أن يكون أقل من 5 ميجابايت', 'File must be under 5MB')); return; }
    setSelectedFile(file);
    try {
      await uploadAvatar(file);
      setSelectedFile(null);
      event.target.value = '';
    } catch (error) {
      setSelectedFile(null);
      event.target.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    if (window.confirm(t('هل أنت متأكد من حذف الصورة الشخصية؟', 'Delete profile picture?'))) {
      await deleteAvatar();
    }
  };

  const toggleField = async (field: keyof VisibleFields) => {
    const updated = { ...visibleFields, [field]: !visibleFields[field] };
    setVisibleFields(updated);
    try {
      await supabase
        .from('profile_customization')
        .update({ visible_fields: updated as any })
        .eq('user_id', profile.user_id);
    } catch (e) {
      console.error('Failed to save visibility', e);
    }
  };

  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const countryCode = profile.country?.toUpperCase();
  const flag = countryCode ? countryFlags[countryCode] : null;
  const countryName = countryCode ? (isArabic ? countryNames[countryCode]?.ar : countryNames[countryCode]?.en) : null;
  const maritalLabel = profile.marital_status ? (isArabic ? maritalStatusLabels[profile.marital_status]?.ar : maritalStatusLabels[profile.marital_status]?.en) : null;
  const jobTitle = isArabic ? (profile.job_title || profile.job_title_en) : (profile.job_title_en || profile.job_title);

  return (
    <Card className={`mb-3 overflow-hidden border-primary/20 ${hasCustom ? 'relative' : ''}`} dir={isArabic ? 'rtl' : 'ltr'} style={cardStyle}>
      {setting?.background_image && (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: `rgba(0,0,0,${setting.overlay_opacity || 0.6})` }} />
      )}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20 relative z-10" />
      
      <div className="p-3 sm:p-4 relative z-10">
        {/* Avatar + Name row */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative group flex-shrink-0">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-3 border-primary/30 shadow-lg ring-2 ring-primary/10">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || ''} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" className="w-6 h-6 p-0 rounded-full" disabled={uploading}
                    onClick={() => document.getElementById('avatar-upload')?.click()}>
                    <Camera className="w-3 h-3" />
                  </Button>
                  {profile.avatar_url && (
                    <Button size="sm" variant="destructive" className="w-6 h-6 p-0 rounded-full" onClick={handleDeleteAvatar} disabled={uploading}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
            <Input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
          
          {/* Name + Badges */}
          <div className="flex-1 min-w-0 space-y-1">
            <h1 className="text-sm sm:text-base font-bold text-foreground font-cairo leading-tight break-words">
              {profile.full_name || t('المستخدم', 'User')}
            </h1>
            {profile.full_name_en && (
              <p className="text-xs text-muted-foreground/80 font-medium" dir="ltr">
                {profile.full_name_en}
              </p>
            )}
            
            <div className="flex flex-wrap gap-1">
              {profile.is_verified && (
                <Badge variant="default" className="flex items-center gap-0.5 text-[9px] px-1.5 py-0 bg-primary/90 h-5">
                  <BadgeCheck className="w-2.5 h-2.5" />
                  <span className="font-cairo">{t("معتمد", "Verified")}</span>
                </Badge>
              )}
              {isKycVerified && (
                <Badge variant="default" className="flex items-center gap-0.5 text-[9px] px-1.5 py-0 bg-emerald-600 hover:bg-emerald-600 text-white h-5">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span className="font-cairo">{t("موثق", "KYC")}</span>
                </Badge>
              )}
            </div>

            {vf.job_title && jobTitle && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Briefcase className="w-3 h-3 text-primary/60" />
                <span>{jobTitle}</span>
              </div>
            )}

            {!isOwnProfile && profile.is_verified && profile.user_id && (
              <FollowButton userId={profile.user_id} isVerified={profile.is_verified} />
            )}

            {uploading && (
              <p className="text-[10px] text-primary">{t("جاري رفع الصورة...", "Uploading...")}</p>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Visibility toggle button (own profile only) */}
        {isOwnProfile && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full h-7 text-[10px] text-muted-foreground mb-2"
            onClick={() => setShowVisibilityEditor(!showVisibilityEditor)}
          >
            {showVisibilityEditor ? <EyeOff className="w-3 h-3 ml-1" /> : <Eye className="w-3 h-3 ml-1" />}
            {t('تحكم في الظاهر للعامة', 'Manage public visibility')}
          </Button>
        )}

        {/* Visibility editor */}
        {showVisibilityEditor && isOwnProfile && (
          <div className="grid grid-cols-3 gap-1.5 mb-2 p-2 rounded-lg bg-muted/20 border border-border/50">
            {(Object.keys(fieldLabels) as (keyof VisibleFields)[]).map(field => (
              <button
                key={field}
                onClick={() => toggleField(field)}
                className={`flex items-center gap-1 text-[9px] px-2 py-1 rounded-md transition-colors ${
                  visibleFields[field] 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-muted/40 text-muted-foreground/50 border border-transparent'
                }`}
              >
                {visibleFields[field] ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                {isArabic ? fieldLabels[field].ar : fieldLabels[field].en}
              </button>
            ))}
          </div>
        )}

        {/* Details grid - compact */}
        <div className="grid grid-cols-2 gap-1.5">
          {vf.email && profile.email && (
            <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/30 rounded-md px-2 py-1.5">
              <Mail className="w-3 h-3 text-primary/60 flex-shrink-0" />
              <span className="truncate" dir="ltr">{profile.email}</span>
            </div>
          )}

          {vf.phone && profile.phone && (
            <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/30 rounded-md px-2 py-1.5">
              <Phone className="w-3 h-3 text-primary/60 flex-shrink-0" />
              <span dir="ltr">{profile.phone}</span>
            </div>
          )}

          {vf.country && flag && (
            <div className="flex items-center gap-1.5 text-[11px] bg-muted/30 rounded-md px-2 py-1.5">
              <span className="text-sm">{flag}</span>
              <span className="text-muted-foreground">{countryName}</span>
            </div>
          )}

          {vf.age && age !== null && (
            <div className="flex items-center gap-1.5 text-[11px] bg-muted/30 rounded-md px-2 py-1.5">
              <Calendar className="w-3 h-3 text-primary/60" />
              <span className="text-muted-foreground">{age} {t('سنة', 'yrs')}</span>
            </div>
          )}

          {vf.date_of_birth && profile.date_of_birth && (
            <div className="flex items-center gap-1.5 text-[11px] bg-muted/30 rounded-md px-2 py-1.5">
              <Calendar className="w-3 h-3 text-primary/60" />
              <span className="text-muted-foreground text-[10px]">{formatDate(profile.date_of_birth, isArabic)}</span>
            </div>
          )}

          {vf.marital_status && maritalLabel && (
            <div className="flex items-center gap-1.5 text-[11px] bg-muted/30 rounded-md px-2 py-1.5">
              <Heart className="w-3 h-3 text-primary/60" />
              <span className="text-muted-foreground">{maritalLabel}</span>
            </div>
          )}

          {vf.join_date && (
            <div className="flex items-center gap-1.5 text-[11px] bg-muted/30 rounded-md px-2 py-1.5">
              <Calendar className="w-3 h-3 text-primary/60" />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] text-muted-foreground/50">{t('انضم', 'Joined')}</span>
                <span className="text-muted-foreground text-[10px]">{formatDate(profile.created_at, isArabic)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bio */}
        {vf.bio && profile.bio && (
          <>
            <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed italic px-1">
              "{profile.bio}"
            </p>
          </>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <>
            <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <Star className="w-3 h-3 text-primary" />
                <span className="text-[11px] font-medium text-muted-foreground">{t("البادجات", "Badges")}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {badges.map((ub: any) => (
                  <div key={ub.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded-full border bg-muted/30 text-[10px]" style={{ borderColor: (ub.badges as any)?.badge_color }}>
                    <span>{(ub.badges as any)?.icon_emoji}</span>
                    <span className="font-cairo" style={{ color: (ub.badges as any)?.badge_color }}>{(ub.badges as any)?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
