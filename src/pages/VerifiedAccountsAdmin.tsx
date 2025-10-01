import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck, X, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  verified_at: string | null;
  followers_count: number | null;
  following_count: number | null;
}

export default function VerifiedAccountsAdmin() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('فشل في تحميل الحسابات');
    } finally {
      setLoading(false);
    }
  };

  const verifyProfile = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('verify_user_profile', {
        p_user_id: userId
      });

      if (error) throw error;
      
      toast.success('تم اعتماد الحساب بنجاح');
      loadProfiles();
    } catch (error: any) {
      console.error('Error verifying profile:', error);
      toast.error(error.message || 'فشل في اعتماد الحساب');
    }
  };

  const unverifyProfile = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('unverify_user_profile', {
        p_user_id: userId
      });

      if (error) throw error;
      
      toast.success('تم إلغاء اعتماد الحساب');
      loadProfiles();
    } catch (error: any) {
      console.error('Error unverifying profile:', error);
      toast.error(error.message || 'فشل في إلغاء اعتماد الحساب');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 arabic-content">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center arabic-text">جاري التحميل...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="min-h-screen bg-background/90">
        <div className="container mx-auto p-6 arabic-content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 arabic-text">
                <BadgeCheck className="w-6 h-6" />
                إدارة الحسابات المعتمدة
              </CardTitle>
              <CardDescription className="arabic-text">
                اعتماد أو إلغاء اعتماد حسابات المستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {profile.full_name?.charAt(0) || <User className="w-6 h-6" />}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold arabic-text">
                            {profile.full_name || 'بدون اسم'}
                          </h3>
                          {profile.is_verified && (
                            <Badge variant="default" className="flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3" />
                              <span className="arabic-text">معتمد</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                          <span>المتابعون: {profile.followers_count || 0}</span>
                          <span>يتابع: {profile.following_count || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {profile.is_verified ? (
                        <Button
                          onClick={() => unverifyProfile(profile.user_id)}
                          variant="destructive"
                          size="sm"
                          className="arabic-text"
                        >
                          <X className="w-4 h-4 ml-2" />
                          إلغاء الاعتماد
                        </Button>
                      ) : (
                        <Button
                          onClick={() => verifyProfile(profile.user_id)}
                          variant="default"
                          size="sm"
                          className="arabic-text"
                        >
                          <BadgeCheck className="w-4 h-4 ml-2" />
                          اعتماد الحساب
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {profiles.length === 0 && (
                  <div className="text-center py-12">
                    <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground arabic-text">لا توجد حسابات</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}