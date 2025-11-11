import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Video, Users, CheckCircle, Clock, XCircle } from "lucide-react";

interface ApplicationStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

const LiveStream = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    social_media_links: [""],
    follower_count: 0,
    description: ""
  });

  useEffect(() => {
    if (user) {
      checkApplicationStatus();
      loadUserProfile();
    }
  }, [user]);

  const checkApplicationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('live_stream_approvals')
        .select('id, status, created_at, reviewed_at, rejection_reason')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setApplicationStatus(data as ApplicationStatus);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setFormData(prev => ({
          ...prev,
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || ""
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.social_media_links];
    newLinks[index] = value;
    setFormData({ ...formData, social_media_links: newLinks });
  };

  const addSocialLink = () => {
    setFormData({
      ...formData,
      social_media_links: [...formData.social_media_links, ""]
    });
  };

  const removeSocialLink = (index: number) => {
    const newLinks = formData.social_media_links.filter((_, i) => i !== index);
    setFormData({ ...formData, social_media_links: newLinks });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('live_stream_approvals')
        .insert({
          user_id: user.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          social_media_links: formData.social_media_links.filter(link => link.trim() !== ""),
          follower_count: formData.follower_count,
          description: formData.description,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "سيتم مراجعة طلبك من قبل الإدارة قريباً"
      });

      checkApplicationStatus();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إرسال الطلب",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" />معتمد</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-4 h-4 mr-1" />قيد المراجعة</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" />مرفوض</Badge>;
      default:
        return null;
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            يجب تسجيل الدخول للوصول إلى منصة البث المباشر
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8"
      style={{
        backgroundImage: `url('/lovable-uploads/egyptian-cat-wings-live.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="min-h-screen bg-background/90">
        <div className="container mx-auto p-6 max-w-4xl">
          <Card className="mb-6 bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Video className="w-16 h-16 text-primary" />
              </div>
              <CardTitle className="text-3xl font-cairo">منصة البث المباشر</CardTitle>
              <CardDescription className="text-lg">
                للأعضاء المعتمدين والمؤثرين والمشاهير
              </CardDescription>
            </CardHeader>
          </Card>

          {applicationStatus && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between font-cairo">
                  <span>حالة الطلب</span>
                  {getStatusBadge(applicationStatus.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>تاريخ التقديم: {new Date(applicationStatus.created_at).toLocaleDateString('ar-EG')}</p>
                  {applicationStatus.reviewed_at && (
                    <p>تاريخ المراجعة: {new Date(applicationStatus.reviewed_at).toLocaleDateString('ar-EG')}</p>
                  )}
                  {applicationStatus.rejection_reason && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        سبب الرفض: {applicationStatus.rejection_reason}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {applicationStatus?.status === 'approved' && (
            <>
              <Card className="mb-6 bg-green-500/10 border-green-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-cairo text-green-600">
                    <CheckCircle className="w-6 h-6" />
                    تم اعتماد حسابك - يمكنك البث الآن
                  </CardTitle>
                  <CardDescription>
                    استخدم الأدوات أدناه للبث المباشر مع جمهورك
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="font-cairo">بث مباشر عبر YouTube</CardTitle>
                  <CardDescription>
                    الطريقة الأولى: ابدأ البث من خلال YouTube Studio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Video className="w-4 h-4" />
                    <AlertDescription>
                      <ol className="list-decimal mr-4 space-y-2">
                        <li>افتح <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">YouTube Studio</a></li>
                        <li>انقر على "إنشاء" ثم "بث مباشر"</li>
                        <li>اختر "البث الآن" واتبع التعليمات</li>
                        <li>انسخ رابط البث وشاركه مع متابعيك</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => window.open('https://studio.youtube.com/channel/UC/livestreaming', '_blank')}
                  >
                    <Video className="w-5 h-5 ml-2" />
                    فتح YouTube Studio
                  </Button>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="font-cairo">بث مباشر عبر Facebook</CardTitle>
                  <CardDescription>
                    الطريقة الثانية: ابدأ البث من خلال Facebook Live
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Video className="w-4 h-4" />
                    <AlertDescription>
                      <ol className="list-decimal mr-4 space-y-2">
                        <li>افتح <a href="https://www.facebook.com/live/create" target="_blank" rel="noopener noreferrer" className="text-primary underline">Facebook Live</a></li>
                        <li>اختر حسابك أو صفحتك</li>
                        <li>اضغط "بث مباشر" واتبع التعليمات</li>
                        <li>شارك البث مع جمهورك</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => window.open('https://www.facebook.com/live/create', '_blank')}
                  >
                    <Video className="w-5 h-5 ml-2" />
                    فتح Facebook Live
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-cairo">بث مباشر عبر Instagram</CardTitle>
                  <CardDescription>
                    الطريقة الثالثة: ابدأ البث من خلال تطبيق Instagram
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Video className="w-4 h-4" />
                    <AlertDescription>
                      <ol className="list-decimal mr-4 space-y-2">
                        <li>افتح تطبيق Instagram على هاتفك</li>
                        <li>اضغط على "+" ثم "بث مباشر"</li>
                        <li>أضف عنوانًا للبث</li>
                        <li>اضغط "بدء بث مباشر"</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </>
          )}

          {(!applicationStatus || applicationStatus.status === 'rejected') && (
            <Card>
              <CardHeader>
                <CardTitle className="font-cairo">تقديم طلب الاعتماد</CardTitle>
                <CardDescription>
                  يرجى ملء البيانات التالية للحصول على موافقة الإدارة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">الاسم الكامل *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      className="font-cairo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="font-cairo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="font-cairo"
                    />
                  </div>

                  <div>
                    <Label>روابط وسائل التواصل الاجتماعي</Label>
                    {formData.social_media_links.map((link, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          value={link}
                          onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                          placeholder="https://..."
                          className="font-cairo"
                        />
                        {formData.social_media_links.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeSocialLink(index)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSocialLink}
                      className="mt-2"
                    >
                      إضافة رابط
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="follower_count">عدد المتابعين</Label>
                    <Input
                      id="follower_count"
                      type="number"
                      value={formData.follower_count}
                      onChange={(e) => setFormData({ ...formData, follower_count: parseInt(e.target.value) || 0 })}
                      className="font-cairo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">نبذة عنك ولماذا تريد البث المباشر *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={5}
                      className="font-cairo"
                    />
                  </div>

                  <Alert>
                    <Users className="w-4 h-4" />
                    <AlertDescription>
                      سيتم مراجعة طلبك من قبل الإدارة، وسيتم إشعارك بالقرار عبر البريد الإلكتروني
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "جاري الإرسال..." : "إرسال الطلب"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStream;
