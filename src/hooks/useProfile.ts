import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
  preferred_language: string | null;
  solana_address: string | null;
  is_verified: boolean | null;
  verified_at: string | null;
  verified_by: string | null;
  followers_count: number | null;
  following_count: number | null;
  date_of_birth: string | null;
  marital_status: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البروفايل",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      toast({
        title: "تم التحديث",
        description: "تم تحديث البروفايل بنجاح"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث البروفايل",
        variant: "destructive"
      });
      throw error;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    console.log('Starting upload process for user:', user.id);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    setUploading(true);
    try {
      // Prepare form data for edge function
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Calling upload-avatar edge function...');
      
      // Call our edge function instead of direct storage upload
      const { data, error } = await supabase.functions.invoke('upload-avatar', {
        body: formData
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data.success) {
        console.error('Upload failed:', data.error);
        throw new Error(data.error);
      }

      console.log('Upload successful via edge function:', data.url);
      
      console.log('Updating profile with new avatar URL...');
      await updateProfile({ avatar_url: data.url });
      
      console.log('Profile updated successfully');
      return data.url;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      
      // More specific error messages
      let errorMessage = "فشل في رفع الصورة";
      if (error.message?.includes('row-level security')) {
        errorMessage = "خطأ في أذونات النظام - يرجى المحاولة مرة أخرى";
      } else if (error.message?.includes('size')) {
        errorMessage = "حجم الملف كبير جداً";
      } else if (error.message?.includes('format')) {
        errorMessage = "نوع الملف غير مدعوم";
      }
      
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async () => {
    if (!user || !profile?.avatar_url) return;

    try {
      const fileName = profile.avatar_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${fileName}`]);
      }

      await updateProfile({ avatar_url: null });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الصورة",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (userId || user) {
      fetchProfile();
    }
  }, [user, userId]);

  return {
    profile,
    loading,
    uploading,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    refetch: fetchProfile
  };
};