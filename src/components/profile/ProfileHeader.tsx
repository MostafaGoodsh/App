import { useState } from 'react';
import { useUICardSettings } from '@/hooks/useUICardSettings';
import { Camera, Trash2, User, BadgeCheck, Calendar, Star, Heart, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProfile, type Profile } from '@/hooks/useProfile';
import { FollowButton } from './FollowButton';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

// Country code to flag emoji
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

interface ProfileHeaderProps {
  profile: Profile;
  badges?: any[];
}

export function ProfileHeader({ profile, badges = [] }: ProfileHeaderProps) {
  const { uploadAvatar, deleteAvatar, uploading } = useProfile();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isOwnProfile = user?.id === profile.user_id;
  const isArabic = language === 'ar' || language === 'both';
  const { getCardStyle, getCardSetting } = useUICardSettings();
  const setting = getCardSetting('profile_header');
  const hasCustom = setting?.background_image || setting?.background_gradient || setting?.background_color;
  const cardStyle = hasCustom ? getCardStyle('profile_header') : {};

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

  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const countryCode = profile.country?.toUpperCase();
  const flag = countryCode ? countryFlags[countryCode] : null;
  const countryName = countryCode ? (isArabic ? countryNames[countryCode]?.ar : countryNames[countryCode]?.en) : null;
  const maritalLabel = profile.marital_status ? (isArabic ? maritalStatusLabels[profile.marital_status]?.ar : maritalStatusLabels[profile.marital_status]?.en) : null;

  return (
    <Card className={`mb-4 overflow-hidden border-primary/20 ${hasCustom ? 'relative' : ''}`} dir={isArabic ? 'rtl' : 'ltr'} style={cardStyle}>
      {setting?.background_image && (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: `rgba(0,0,0,${setting.overlay_opacity || 0.6})` }} />
      )}
      {/* Top decorative bar */}
      <div className="h-2 bg-gradient-to-r from-primary via-primary/60 to-primary/20 relative z-10" />
      
      <div className="p-4 sm:p-5 relative z-10">
        {/* ID Card Layout */}
        <div className="flex items-start gap-4">
          {/* Large Avatar */}
          <div className="relative group flex-shrink-0">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-primary/30 shadow-xl ring-2 ring-primary/10">
              <AvatarImage 
                src={profile.avatar_url || undefined} 
                alt={profile.full_name || t('صورة شخصية', 'Profile picture')} 
              />
              <AvatarFallback className="text-2xl sm:text-3xl bg-primary/10 text-primary">
                {profile.full_name 
                  ? profile.full_name.charAt(0).toUpperCase()
                  : <User className="w-10 h-10" />
                }
              </AvatarFallback>
            </Avatar>
            
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" className="w-7 h-7 p-0 rounded-full" disabled={uploading}
                    onClick={() => document.getElementById('avatar-upload')?.click()}>
                    <Camera className="w-3.5 h-3.5" />
                  </Button>
                  {profile.avatar_url && (
                    <Button size="sm" variant="destructive" className="w-7 h-7 p-0 rounded-full" onClick={handleDeleteAvatar} disabled={uploading}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <Input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 min-w-0 space-y-1 pt-0.5">
            {/* Name + Verified */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold truncate">
                {profile.full_name || t('المستخدم', 'User')}
              </h1>
              {profile.is_verified && (
                <Badge variant="default" className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-primary/90">
                  <BadgeCheck className="w-3 h-3" />
                  <span className="font-cairo">{t("معتمد", "Verified")}</span>
                </Badge>
              )}
            </div>
            
            {/* Email */}
            <p className="text-[11px] text-muted-foreground truncate">{profile.email}</p>
            
            {/* Info chips row */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {/* Country flag */}
              {flag && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">
                  <span className="text-sm">{flag}</span>
                  <span>{countryName}</span>
                </span>
              )}
              
              {/* Age */}
              {age !== null && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>{age} {t('سنة', 'yrs')}</span>
                </span>
              )}
              
              {/* Marital status */}
              {maritalLabel && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">
                  <Heart className="w-3 h-3" />
                  <span>{maritalLabel}</span>
                </span>
              )}
              
              {/* Join date */}
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">
                <Calendar className="w-3 h-3" />
                <span>{new Date(profile.created_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}</span>
              </span>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed pt-0.5">
                {profile.bio}
              </p>
            )}
            
            {/* Follow button */}
            {!isOwnProfile && profile.is_verified && profile.user_id && (
              <div className="pt-1">
                <FollowButton userId={profile.user_id} isVerified={profile.is_verified} />
              </div>
            )}
            
            {uploading && (
              <p className="text-xs text-primary">{t("جاري رفع الصورة...", "Uploading...")}</p>
            )}
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">{t("البادجات", "Badges")}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {badges.map((ub: any) => (
                <div key={ub.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full border bg-muted/30 text-[11px]" style={{ borderColor: (ub.badges as any)?.badge_color }}>
                  <span>{(ub.badges as any)?.icon_emoji}</span>
                  <span className="font-cairo" style={{ color: (ub.badges as any)?.badge_color }}>{(ub.badges as any)?.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
