import { useState } from 'react';
import { Camera, Trash2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useProfile, type Profile } from '@/hooks/useProfile';

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { uploadAvatar, deleteAvatar, uploading } = useProfile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح | Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الملف يجب أن يكون أقل من 5 ميجابايت | File size must be less than 5MB');
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
    if (window.confirm('هل أنت متأكد من حذف الصورة الشخصية؟ | Are you sure you want to delete your profile picture?')) {
      await deleteAvatar();
    }
  };

  return (
    <Card className="p-4 sm:p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
        <div className="relative group">
          <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-lg">
            <AvatarImage 
              src={profile.avatar_url || undefined} 
              alt={profile.full_name || 'صورة شخصية'} 
            />
            <AvatarFallback className="text-xl sm:text-2xl">
              {profile.full_name 
                ? profile.full_name.charAt(0).toUpperCase()
                : <User className="w-8 h-8 sm:w-12 sm:h-12" />
              }
            </AvatarFallback>
          </Avatar>
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0"
                disabled={uploading}
                onClick={() => {
                  console.log('Camera button clicked');
                  document.getElementById('avatar-upload')?.click();
                }}
              >
                <Camera className="w-4 h-4" />
              </Button>
              
              {profile.avatar_url && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-8 h-8 p-0"
                  onClick={handleDeleteAvatar}
                  disabled={uploading}
                >
                  <Trash2 className="w-4 h-4" />
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
        
        <div className="text-center md:text-right flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold arabic-text mb-2 truncate">
            {profile.full_name || 'المستخدم'}
          </h1>
          
          <p className="text-sm sm:text-base text-muted-foreground arabic-text mb-4 truncate">
            {profile.email}
          </p>
          
          {profile.bio && (
            <p className="text-sm arabic-content leading-relaxed max-w-md mx-auto md:mx-0 line-clamp-3">
              {profile.bio}
            </p>
          )}
          
          {uploading && (
            <p className="text-sm text-primary mt-2 arabic-text">
              <span className="block sm:hidden">جاري رفع الصورة...</span>
              <span className="hidden sm:block">جاري رفع الصورة... | Uploading image...</span>
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}