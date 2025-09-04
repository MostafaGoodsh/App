import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Globe, 
  Save,
  User,
  AtSign,
  Phone
} from 'lucide-react';
import { useProfile, type Profile } from '@/hooks/useProfile';

const profileSchema = z.object({
  full_name: z.string().min(1, 'الاسم مطلوب'),
  email: z.string().email('إيميل غير صالح').optional().or(z.literal('')),
  phone: z.string().optional(),
  bio: z.string().max(500, 'البايو يجب أن يكون أقل من 500 حرف').optional(),
  website_url: z.string().url('رابط غير صالح').optional().or(z.literal('')),
  instagram_url: z.string().url('رابط غير صالح').optional().or(z.literal('')),
  twitter_url: z.string().url('رابط غير صالح').optional().or(z.literal('')),
  linkedin_url: z.string().url('رابط غير صالح').optional().or(z.literal('')),
  facebook_url: z.string().url('رابط غير صالح').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  profile: Profile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const { updateProfile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      bio: profile.bio || '',
      website_url: profile.website_url || '',
      instagram_url: profile.instagram_url || '',
      twitter_url: profile.twitter_url || '',
      linkedin_url: profile.linkedin_url || '',
      facebook_url: profile.facebook_url || '',
    }
  });

  useEffect(() => {
    form.reset({
      full_name: profile.full_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      bio: profile.bio || '',
      website_url: profile.website_url || '',
      instagram_url: profile.instagram_url || '',
      twitter_url: profile.twitter_url || '',
      linkedin_url: profile.linkedin_url || '',
      facebook_url: profile.facebook_url || '',
    });
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      await updateProfile(data);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="arabic-text">
          تحرير البروفايل الشخصي | Edit Personal Profile
        </CardTitle>
        <CardDescription className="arabic-text">
          قم بتحديث معلوماتك الشخصية وروابط التواصل الاجتماعي | Update your personal information and social media links
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold arabic-text flex items-center gap-2">
              <User className="w-5 h-5" />
              المعلومات الأساسية | Basic Information
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="full_name" className="arabic-text">الاسم الكامل *</Label>
                <Input
                  id="full_name"
                  {...form.register('full_name')}
                  className="arabic-text"
                  placeholder="أدخل اسمك الكامل"
                />
                {form.formState.errors.full_name && (
                  <p className="text-sm text-destructive arabic-text mt-1">
                    {form.formState.errors.full_name.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email" className="arabic-text flex items-center gap-1">
                  <AtSign className="w-4 h-4" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="example@domain.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive arabic-text mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone" className="arabic-text flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  رقم الهاتف
                </Label>
                <Input
                  id="phone"
                  {...form.register('phone')}
                  className="arabic-text"
                  placeholder="+966 5xxxxxxxx"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio" className="arabic-text">نبذة شخصية</Label>
              <Textarea
                id="bio"
                {...form.register('bio')}
                className="arabic-content"
                placeholder="اكتب نبذة عنك..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1 arabic-text">
                {form.watch('bio')?.length || 0}/500 حرف
              </p>
              {form.formState.errors.bio && (
                <p className="text-sm text-destructive arabic-text mt-1">
                  {form.formState.errors.bio.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Social Media Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold arabic-text">
              روابط التواصل الاجتماعي | Social Media Links
            </h3>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="website_url" className="arabic-text flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  الموقع الشخصي
                </Label>
                <Input
                  id="website_url"
                  {...form.register('website_url')}
                  placeholder="https://your-website.com"
                />
                {form.formState.errors.website_url && (
                  <p className="text-sm text-destructive arabic-text mt-1">
                    {form.formState.errors.website_url.message}
                  </p>
                )}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="instagram_url" className="arabic-text flex items-center gap-1">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram_url"
                    {...form.register('instagram_url')}
                    placeholder="https://instagram.com/username"
                  />
                  {form.formState.errors.instagram_url && (
                    <p className="text-sm text-destructive arabic-text mt-1">
                      {form.formState.errors.instagram_url.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="twitter_url" className="arabic-text flex items-center gap-1">
                    <Twitter className="w-4 h-4" />
                    Twitter/X
                  </Label>
                  <Input
                    id="twitter_url"
                    {...form.register('twitter_url')}
                    placeholder="https://twitter.com/username"
                  />
                  {form.formState.errors.twitter_url && (
                    <p className="text-sm text-destructive arabic-text mt-1">
                      {form.formState.errors.twitter_url.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="linkedin_url" className="arabic-text flex items-center gap-1">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin_url"
                    {...form.register('linkedin_url')}
                    placeholder="https://linkedin.com/in/username"
                  />
                  {form.formState.errors.linkedin_url && (
                    <p className="text-sm text-destructive arabic-text mt-1">
                      {form.formState.errors.linkedin_url.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="facebook_url" className="arabic-text flex items-center gap-1">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook_url"
                    {...form.register('facebook_url')}
                    placeholder="https://facebook.com/username"
                  />
                  {form.formState.errors.facebook_url && (
                    <p className="text-sm text-destructive arabic-text mt-1">
                      {form.formState.errors.facebook_url.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="arabic-text"
            >
              <Save className="w-4 h-4 ml-2" />
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}