import { useState } from 'react';
import { Camera, Trash2, User, BadgeCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProfile, type Profile } from '@/hooks/useProfile';
import { FollowButton } from './FollowButton';
import { useAuth } from '@/hooks/useAuth';

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { uploadAvatar, deleteAvatar, uploading } = useProfile();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isOwnProfile = user?.id === profile.user_id;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setSelectedFile(file);
    try {
      await uploadAvatar(file);
      setSelectedFile(null);
      // Reset the input to allow uploading the same file again
      event.target.value = '';
    } catch (error) {
      setSelectedFile(null);
      // Reset the input on error too
      event.target.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    if (window.confirm('هل أنت متأكد من حذف الصورة الشخصية؟')) {
      await deleteAvatar();
    }
  };

  return (
    <Card className="p-4 sm:p-6 mb-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative group">
          <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 border-4 border-background shadow-lg">
            <AvatarImage 
              src={profile.avatar_url || undefined} 
              alt={profile.full_name || 'صورة شخصية'} 
            />
            <AvatarFallback className="text-lg sm:text-xl md:text-2xl">
              {profile.full_name 
                ? profile.full_name.charAt(0).toUpperCase()
                : <User className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12" />
              }
            </AvatarFallback>
          </Avatar>
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
            <div className="flex gap-1 sm:gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-6 h-6 sm:w-8 sm:h-8 p-0"
                disabled={uploading}
                onClick={() => {
                  console.log('Camera button clicked');
                  document.getElementById('avatar-upload')?.click();
                }}
              >
                <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              
              {profile.avatar_url && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-6 h-6 sm:w-8 sm:h-8 p-0"
                  onClick={handleDeleteAvatar}
                  disabled={uploading}
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
            </div>
          </div>
          
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        <div className="w-full text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-sm sm:text-base font-bold">
              {profile.full_name || 'المستخدم'}
            </h1>
            {profile.is_verified && (
              <Badge variant="default" className="flex items-center gap-1 text-xs">
                <BadgeCheck className="w-3 h-3" />
                <span className="arabic-text">معتمد</span>
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mb-2 text-center">
            {profile.email}
          </p>
          
          {/* Follow button - only show for verified profiles when viewing others' profiles */}
          {!isOwnProfile && profile.is_verified && profile.user_id && (
            <div className="flex justify-center mb-2">
              <FollowButton userId={profile.user_id} isVerified={profile.is_verified} />
            </div>
          )}
          
          {profile.bio && (
            <p className="text-xs leading-relaxed max-w-sm mx-auto line-clamp-2 mb-2">
              {profile.bio}
            </p>
          )}
          
          {uploading && (
            <p className="text-xs text-primary mt-2">
              جاري رفع الصورة...
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}