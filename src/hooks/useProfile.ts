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
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      console.log('Upload filename:', fileName);
      
      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath && oldPath !== fileName) {
          console.log('Removing old avatar:', `${user.id}/${oldPath}`);
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      console.log('Uploading to storage...');
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful, getting public URL...');
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);
      
      console.log('Updating profile with new avatar URL...');
      await updateProfile({ avatar_url: publicUrl });
      
      console.log('Profile updated successfully');
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "خطأ",
        description: "فشل في رفع الصورة",
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
    if (user) {
      fetchProfile();
    }
  }, [user]);

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