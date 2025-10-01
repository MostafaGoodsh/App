import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useFollow = (profileUserId?: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profileUserId) {
      checkFollowStatus();
      loadFollowCounts();
    }
  }, [profileUserId, user]);

  const checkFollowStatus = async () => {
    if (!user || !profileUserId) return;

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profileUserId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const loadFollowCounts = async () => {
    if (!profileUserId) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('followers_count, following_count')
        .eq('user_id', profileUserId)
        .single();

      if (error) throw error;
      if (profile) {
        setFollowersCount(profile.followers_count || 0);
        setFollowingCount(profile.following_count || 0);
      }
    } catch (error) {
      console.error('Error loading follow counts:', error);
    }
  };

  const toggleFollow = async () => {
    if (!user || !profileUserId) {
      toast.error('يجب تسجيل الدخول للمتابعة');
      return;
    }

    if (user.id === profileUserId) {
      toast.error('لا يمكنك متابعة نفسك');
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileUserId);

        if (error) throw error;
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast.success('تم إلغاء المتابعة');
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: profileUserId
          });

        if (error) throw error;
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success('تمت المتابعة بنجاح');
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast.error('حدث خطأ أثناء تحديث المتابعة');
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing,
    followersCount,
    followingCount,
    loading,
    toggleFollow
  };
};