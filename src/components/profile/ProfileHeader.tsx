import { useState } from 'react';
import { Camera, Trash2, User, BadgeCheck, Calendar, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProfile, type Profile } from '@/hooks/useProfile';
import { FollowButton } from './FollowButton';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('يرجى اختيار ملف صورة صالح'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('حجم الملف يجب أن يكون أقل من 5 ميجابايت'); return; }
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
    if (window.confirm('هل أنت متأكد من حذف الصورة الشخصية؟')) {
      await deleteAvatar();
    }
  };

  return (
    <Card className="mb-4 overflow-hidden border-primary/20">
      {/* Top decorative bar */}
      <div className="h-2 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
      
      <div className="p-4 sm:p-6">
        {/* ID Card Layout: Avatar left/right + Info */}
        <div className="flex items-start gap-4">
          {/* Large Avatar */}
          <div className="relative group flex-shrink-0">
            <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-primary/30 shadow-xl ring-2 ring-primary/10">
              <AvatarImage 
                src={profile.avatar_url || undefined} 
                alt={profile.full_name || 'صورة شخصية'} 
              />
              <AvatarFallback className="text-2xl sm:text-3xl bg-primary/10 text-primary">
                {profile.full_name 
                  ? profile.full_name.charAt(0).toUpperCase()
                  : <User className="w-10 h-10 sm:w-12 sm:h-12" />
                }
              </AvatarFallback>
            </Avatar>
            
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-7 h-7 p-0 rounded-full"
                    disabled={uploading}
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </Button>
                  {profile.avatar_url && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-7 h-7 p-0 rounded-full"
                      onClick={handleDeleteAvatar}
                      disabled={uploading}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          
          {/* Profile Info - compact ID style */}
          <div className="flex-1 min-w-0 space-y-1.5 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold truncate">
                {profile.full_name || t('المستخدم')}
              </h1>
              {profile.is_verified && (
                <Badge variant="default" className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-primary/90">
                  <BadgeCheck className="w-3 h-3" />
                  <span className="font-cairo">{t("معتمد")}</span>
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground truncate">
              {profile.email}
            </p>
            
            {profile.bio && (
              <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{new Date(profile.created_at).toLocaleDateString(language === 'ar' || language === 'both' ? 'ar-SA' : 'en-US')}</span>
            </div>
            
            {!isOwnProfile && profile.is_verified && profile.user_id && (
              <div className="pt-1">
                <FollowButton userId={profile.user_id} isVerified={profile.is_verified} />
              </div>
            )}
            
            {uploading && (
              <p className="text-xs text-primary">{t("جاري رفع الصورة...")}</p>
            )}
          </div>
        </div>

        {/* Badges row inside card */}
        {badges.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">{t("البادجات")}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {badges.map((ub: any) => (
                <div key={ub.id} className="flex items-center gap-1 px-2.5 py-1 rounded-full border bg-muted/30 text-xs" style={{ borderColor: (ub.badges as any)?.badge_color }}>
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
