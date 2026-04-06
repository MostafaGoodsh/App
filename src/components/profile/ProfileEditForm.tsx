import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Instagram, Twitter, Linkedin, Facebook, Globe, Save,
  User, AtSign, Phone, Calendar, Heart, MapPin
} from 'lucide-react';
import { useProfile, type Profile } from '@/hooks/useProfile';
import { useLanguage } from '@/contexts/LanguageContext';

const profileSchema = z.object({
  full_name: z.string().min(1, 'الاسم مطلوب'),
  full_name_en: z.string().optional().or(z.literal('')),
  job_title: z.string().optional().or(z.literal('')),
  job_title_en: z.string().optional().or(z.literal('')),
  email: z.string().email('إيميل غير صالح').optional().or(z.literal('')),
  phone: z.string().optional(),
  bio: z.string().max(500, 'البايو يجب أن يكون أقل من 500 حرف').optional(),
  date_of_birth: z.string().optional().or(z.literal('')),
  marital_status: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  website_url: z.string().url('رابط غير صالح').optional().or(z.literal('')),
  instagram_url: z.string().url('رابط غير صالح').optional().or(z.literal('')),
  twitter_url: z.string().url('رابط غير صالح').optional().or(z.literal('')),
  linkedin_url: z.string().url('رابط غير صالح').optional().or(z.literal('')),
  facebook_url: z.string().url('رابط غير صالح').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const countries = [
  { code: 'EG', ar: 'مصر', en: 'Egypt' }, { code: 'SA', ar: 'السعودية', en: 'Saudi Arabia' },
  { code: 'AE', ar: 'الإمارات', en: 'UAE' }, { code: 'KW', ar: 'الكويت', en: 'Kuwait' },
  { code: 'QA', ar: 'قطر', en: 'Qatar' }, { code: 'BH', ar: 'البحرين', en: 'Bahrain' },
  { code: 'OM', ar: 'عُمان', en: 'Oman' }, { code: 'IQ', ar: 'العراق', en: 'Iraq' },
  { code: 'JO', ar: 'الأردن', en: 'Jordan' }, { code: 'LB', ar: 'لبنان', en: 'Lebanon' },
  { code: 'PS', ar: 'فلسطين', en: 'Palestine' }, { code: 'SY', ar: 'سوريا', en: 'Syria' },
  { code: 'YE', ar: 'اليمن', en: 'Yemen' }, { code: 'LY', ar: 'ليبيا', en: 'Libya' },
  { code: 'TN', ar: 'تونس', en: 'Tunisia' }, { code: 'DZ', ar: 'الجزائر', en: 'Algeria' },
  { code: 'MA', ar: 'المغرب', en: 'Morocco' }, { code: 'SD', ar: 'السودان', en: 'Sudan' },
  { code: 'TR', ar: 'تركيا', en: 'Turkey' }, { code: 'US', ar: 'أمريكا', en: 'USA' },
  { code: 'GB', ar: 'بريطانيا', en: 'UK' }, { code: 'FR', ar: 'فرنسا', en: 'France' },
  { code: 'DE', ar: 'ألمانيا', en: 'Germany' }, { code: 'RU', ar: 'روسيا', en: 'Russia' },
  { code: 'IN', ar: 'الهند', en: 'India' }, { code: 'PK', ar: 'باكستان', en: 'Pakistan' },
  { code: 'BD', ar: 'بنغلاديش', en: 'Bangladesh' }, { code: 'ID', ar: 'إندونيسيا', en: 'Indonesia' },
  { code: 'MY', ar: 'ماليزيا', en: 'Malaysia' }, { code: 'NG', ar: 'نيجيريا', en: 'Nigeria' },
];

interface ProfileEditFormProps {
  profile: Profile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const { updateProfile } = useProfile();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar' || language === 'both';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      bio: profile.bio || '',
      date_of_birth: profile.date_of_birth || '',
      marital_status: profile.marital_status || '',
      country: profile.country || '',
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
      date_of_birth: profile.date_of_birth || '',
      marital_status: profile.marital_status || '',
      country: profile.country || '',
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
        <CardTitle>{t("تعديل الملف الشخصي", "Edit Profile")}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              {t("المعلومات الأساسية", "Basic Information")}
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="full_name">{t("الاسم الكامل", "Full Name")} *</Label>
                <Input id="full_name" {...form.register('full_name')} placeholder={t("أدخل اسمك", "Enter your name")} />
                {form.formState.errors.full_name && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.full_name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email" className="flex items-center gap-1">
                  <AtSign className="w-3.5 h-3.5" />
                  {t("البريد الإلكتروني", "Email")}
                </Label>
                <Input id="email" type="email" {...form.register('email')} placeholder="example@domain.com" />
              </div>
              
              <div>
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {t("رقم الهاتف", "Phone")}
                </Label>
                <Input id="phone" {...form.register('phone')} placeholder="+20 1xxxxxxxxx" />
              </div>

              <div>
                <Label htmlFor="date_of_birth" className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {t("تاريخ الميلاد", "Date of Birth")}
                </Label>
                <Input id="date_of_birth" type="date" {...form.register('date_of_birth')} />
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {t("البلد", "Country")}
                </Label>
                <Select value={form.watch('country') || ''} onValueChange={(v) => form.setValue('country', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("اختر البلد", "Select country")} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        {isArabic ? c.ar : c.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  {t("الحالة الاجتماعية", "Marital Status")}
                </Label>
                <Select value={form.watch('marital_status') || ''} onValueChange={(v) => form.setValue('marital_status', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("اختر الحالة", "Select status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">{t("أعزب", "Single")}</SelectItem>
                    <SelectItem value="married">{t("متزوج", "Married")}</SelectItem>
                    <SelectItem value="divorced">{t("مطلق", "Divorced")}</SelectItem>
                    <SelectItem value="widowed">{t("أرمل", "Widowed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio">{t("نبذة شخصية", "Bio")}</Label>
              <Textarea id="bio" {...form.register('bio')} placeholder={t("اكتب نبذة عنك...", "Write about yourself...")} rows={3} />
              <p className="text-xs text-muted-foreground mt-1">
                {form.watch('bio')?.length || 0}/500
              </p>
            </div>
          </div>

          <Separator />

          {/* Social Media Links */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">
              {t("روابط التواصل", "Social Links")}
            </h3>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="website_url" className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {t("الموقع الشخصي", "Website")}
                </Label>
                <Input id="website_url" {...form.register('website_url')} placeholder="https://..." />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="instagram_url" className="flex items-center gap-1"><Instagram className="w-3.5 h-3.5" /> Instagram</Label>
                  <Input id="instagram_url" {...form.register('instagram_url')} placeholder="https://instagram.com/..." />
                </div>
                <div>
                  <Label htmlFor="twitter_url" className="flex items-center gap-1"><Twitter className="w-3.5 h-3.5" /> Twitter/X</Label>
                  <Input id="twitter_url" {...form.register('twitter_url')} placeholder="https://twitter.com/..." />
                </div>
                <div>
                  <Label htmlFor="linkedin_url" className="flex items-center gap-1"><Linkedin className="w-3.5 h-3.5" /> LinkedIn</Label>
                  <Input id="linkedin_url" {...form.register('linkedin_url')} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <Label htmlFor="facebook_url" className="flex items-center gap-1"><Facebook className="w-3.5 h-3.5" /> Facebook</Label>
                  <Input id="facebook_url" {...form.register('facebook_url')} placeholder="https://facebook.com/..." />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 me-2" />
              {isSubmitting ? t('جاري الحفظ...', 'Saving...') : t('حفظ التغييرات', 'Save Changes')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
