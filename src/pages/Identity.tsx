import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Shield, 
  Upload, 
  FileText, 
  Camera, 
  CheckCircle, 
  Clock, 
  XCircle,
  User,
  Calendar,
  MapPin,
  Phone,
  FileImage
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CameraCapture } from "@/components/ui/camera-capture";

interface IdentityVerification {
  id: string;
  verification_type: string;
  status: string;
  document_type: string | null;
  document_number: string | null;
  full_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  address: string | null;
  phone_number: string | null;
  verification_notes: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

const DOCUMENT_TYPES = [
  { value: 'national_id', label: 'الهوية الوطنية', icon: '🆔' },
  { value: 'passport', label: 'جواز السفر', icon: '📔' },
  { value: 'driving_license', label: 'رخصة القيادة', icon: '🚗' },
  { value: 'residence_permit', label: 'الإقامة', icon: '📋' }
];

const VERIFICATION_STEPS = [
  { id: 'personal', title: 'المعلومات الشخصية', description: 'أدخل بياناتك الأساسية' },
  { id: 'documents', title: 'الوثائق', description: 'رفع صور الوثائق المطلوبة' },
  { id: 'verification', title: 'التحقق', description: 'انتظار مراجعة وتأكيد الهوية' }
];

const Identity = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/identity";
  const { user } = useAuth();
  const { toast } = useToast();
  const [verification, setVerification] = useState<IdentityVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Form data
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentFrontFile, setDocumentFrontFile] = useState<File | null>(null);
  const [documentBackFile, setDocumentBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('identity_verification')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setVerification(data);
        // Pre-fill form with existing data
        setFullName(data.full_name || "");
        setDateOfBirth(data.date_of_birth || "");
        setNationality(data.nationality || "");
        setAddress(data.address || "");
        setPhoneNumber(data.phone_number || "");
        setDocumentType(data.document_type || "");
        setDocumentNumber(data.document_number || "");

        // Set appropriate step based on status
        if (data.status === 'pending' || data.status === 'verified' || data.status === 'approved') {
          setCurrentStep(2);
        } else if (data.document_type) {
          setCurrentStep(1);
        }
      }
    } catch (error) {
      console.error('Error fetching verification:', error);
    }
    setLoading(false);
  };

  const submitPersonalInfo = async () => {
    if (!fullName || !dateOfBirth || !nationality || !address || !phoneNumber) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const verificationData = {
        user_id: user?.id,
        verification_type: 'kyc',
        status: 'draft',
        full_name: fullName,
        date_of_birth: dateOfBirth,
        nationality: nationality,
        address: address,
        phone_number: phoneNumber
      };

      if (verification) {
        // Update existing record
        const { error } = await supabase
          .from('identity_verification')
          .update(verificationData)
          .eq('id', verification.id);

        if (error) throw error;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('identity_verification')
          .insert([verificationData])
          .select()
          .single();

        if (error) throw error;
        setVerification(data);
      }

      toast({
        title: "تم حفظ البيانات",
        description: "تم حفظ معلوماتك الشخصية بنجاح"
      });

      setCurrentStep(1);
    } catch (error) {
      console.error('Error saving personal info:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive"
      });
    }
    setSubmitting(false);
  };

  const uploadFileToStorage = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('identity-documents')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data.path;
  };

  const submitDocuments = async () => {
    if (!documentType || !documentNumber) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى اختيار نوع الوثيقة وإدخال رقمها",
        variant: "destructive"
      });
      return;
    }

    if (!documentFrontFile || !selfieFile) {
      toast({
        title: "الوثائق مطلوبة",
        description: "يرجى رفع صورة الوثيقة والصورة الشخصية",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      setUploadProgress(20);
      
      // Upload files
      const timestamp = Date.now();
      const userId = user?.id;
      
      const frontPath = await uploadFileToStorage(
        documentFrontFile, 
        `${userId}/front_${timestamp}.${documentFrontFile.name.split('.').pop()}`
      );
      
      setUploadProgress(50);
      
      let backPath = null;
      if (documentBackFile) {
        backPath = await uploadFileToStorage(
          documentBackFile, 
          `${userId}/back_${timestamp}.${documentBackFile.name.split('.').pop()}`
        );
      }
      
      setUploadProgress(70);
      
      const selfiePath = await uploadFileToStorage(
        selfieFile, 
        `${userId}/selfie_${timestamp}.${selfieFile.name.split('.').pop()}`
      );
      
      setUploadProgress(90);

      // Update database
      const { error } = await supabase
        .from('identity_verification')
        .update({
          document_type: documentType,
          document_number: documentNumber,
          document_front_url: frontPath,
          document_back_url: backPath,
          selfie_url: selfiePath,
          status: 'pending'
        })
        .eq('id', verification?.id);

      if (error) throw error;

      setUploadProgress(100);

      toast({
        title: "تم إرسال الطلب",
        description: "تم إرسال طلب التحقق من الهوية للمراجعة"
      });

      setCurrentStep(2);
      fetchVerificationStatus();
    } catch (error) {
      console.error('Error submitting documents:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء رفع الوثائق",
        variant: "destructive"
      });
    }
    setSubmitting(false);
    setUploadProgress(0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved': return 'تم التحقق';
      case 'pending': return 'قيد المراجعة';
      case 'rejected': return 'مرفوض';
      case 'draft': return 'مسودة';
      default: return 'غير محدد';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>توثيق الهوية — Identity Verification</title>
        <meta name="description" content="توثيق الهوية (KYC) للامتثال للوائح ولضمان أمان المعاملات والحسابات." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      
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
          <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="font-cairo text-3xl md:text-5xl font-bold mb-4" dir="rtl">
              توثيق الهوية | <span className="font-playfair">Identity Verification</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-4 font-cairo" dir="rtl">
              عملية التحقق من الهوية (KYC) تضمن أمان حسابك والامتثال للمعايير المطلوبة. يرجى تقديم بيانات دقيقة ومطابقة للوثائق الرسمية.
            </p>
            
            {/* تحذير مهم */}
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 max-w-2xl mx-auto text-right" dir="rtl">
              <p className="text-sm font-cairo text-destructive font-semibold mb-2">⚠️ تحذير مهم</p>
              <p className="text-xs font-cairo text-muted-foreground leading-relaxed">
                يُرجى تحري الدقة الكاملة ومطابقة الواقع في جميع المعلومات المقدمة. أي معلومات مغلوطة أو غير مطابقة قد تؤدي إلى <span className="text-destructive font-medium">تعليق الحساب</span> حتى بدء دورة التحقق القادمة. 
                كما أن محاولات التحايل على نظام التوثيق قد تؤدي إلى <span className="text-destructive font-medium">حظر الحساب نهائياً</span>. 
                الكذب والتلاعب والتحايل هو بالضبط ما نسعى لرصده وفصله واستبعاده والتعريف بأنماطه.
              </p>
            </div>
          </div>

          {/* Current Status */}
          {verification && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-cairo">
                  {getStatusIcon(verification.status)}
                  حالة التحقق الحالية
                  <span className="text-xs text-muted-foreground font-normal opacity-70" dir="ltr">Current Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className={getStatusColor(verification.status)}>
                      {getStatusText(verification.status)}
                    </Badge>
                    {verification.verified_at && (
                      <p className="text-sm text-muted-foreground mt-2">
                        تم التحقق في: {new Date(verification.verified_at).toLocaleDateString('ar-SA')}
                      </p>
                    )}
                    {verification.verification_notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        ملاحظات: {verification.verification_notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      تاريخ الطلب: {new Date(verification.created_at).toLocaleDateString('ar-SA')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      آخر تحديث: {new Date(verification.updated_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              {VERIFICATION_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  {index < VERIFICATION_STEPS.length - 1 && (
                    <div className={`w-16 h-0.5 ${
                      index < currentStep 
                        ? 'bg-primary' 
                        : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {VERIFICATION_STEPS.map((step, index) => (
                <div key={step.id} className={`text-center p-4 rounded-lg ${
                  index <= currentStep 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-muted/50'
                }`}>
                  <h3 className="font-semibold font-cairo">{step.title}</h3>
                  <p className="text-sm text-muted-foreground font-cairo">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-cairo">
                  <User className="h-5 w-5" />
                  المعلومات الشخصية
                  <span className="text-xs text-muted-foreground font-normal opacity-70" dir="ltr">Personal Information</span>
                </CardTitle>
                <CardDescription className="font-cairo">
                  أدخل معلوماتك الشخصية الصحيحة والمطابقة للوثائق الرسمية
                  <span className="text-xs block opacity-70" dir="ltr">Enter accurate personal details matching your official documents</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-cairo">الاسم الكامل * <span className="text-xs text-muted-foreground opacity-70">Full Name</span></Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="أدخل اسمك الكامل كما يظهر في الوثائق"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="font-cairo">تاريخ الميلاد * <span className="text-xs text-muted-foreground opacity-70">Date of Birth</span></Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="font-cairo">الجنسية * <span className="text-xs text-muted-foreground opacity-70">Nationality</span></Label>
                    <Input
                      id="nationality"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="مثال: سعودي"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="font-cairo">رقم الهاتف * <span className="text-xs text-muted-foreground opacity-70">Phone</span></Label>
                    <Input
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+966xxxxxxxxx"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="font-cairo">العنوان الكامل * <span className="text-xs text-muted-foreground opacity-70">Address</span></Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="أدخل عنوانك الكامل"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={submitPersonalInfo} 
                  disabled={submitting}
                  className="w-full font-cairo"
                >
                  {submitting ? "جاري الحفظ..." : <>حفظ والمتابعة <span className="text-xs opacity-70 mr-1">Save & Continue</span></>}
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  رفع الوثائق
                </CardTitle>
                <CardDescription>
                  اختر نوع الوثيقة وأدخل رقمها. سيتم طلب رفع صور الوثائق لاحقاً
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">نوع الوثيقة *</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الوثيقة" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((doc) => (
                          <SelectItem key={doc.value} value={doc.value}>
                            <div className="flex items-center gap-2">
                              <span>{doc.icon}</span>
                              {doc.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentNumber">رقم الوثيقة *</Label>
                    <Input
                      id="documentNumber"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="أدخل رقم الوثيقة"
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Front Document */}
                    <div className="space-y-2">
                      <Label htmlFor="frontDocument">صورة الوثيقة - الوجه الأمامي *</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                        <input
                          id="frontDocument"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setDocumentFrontFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="frontDocument" className="cursor-pointer">
                          {documentFrontFile ? (
                            <div className="space-y-2">
                              <FileImage className="h-8 w-8 mx-auto text-green-500" />
                              <p className="text-sm text-green-600">{documentFrontFile.name}</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">اضغط لرفع الصورة</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Back Document */}
                    <div className="space-y-2">
                      <Label htmlFor="backDocument">صورة الوثيقة - الوجه الخلفي (اختياري)</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                        <input
                          id="backDocument"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setDocumentBackFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="backDocument" className="cursor-pointer">
                          {documentBackFile ? (
                            <div className="space-y-2">
                              <FileImage className="h-8 w-8 mx-auto text-green-500" />
                              <p className="text-sm text-green-600">{documentBackFile.name}</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">اضغط لرفع الصورة</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Selfie */}
                  <div className="space-y-2">
                    <Label htmlFor="selfieDocument">صورة شخصية مع حمل الوثيقة *</Label>
                    <div className="space-y-3">
                      {selfieFile ? (
                        <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center max-w-md mx-auto">
                          <div className="space-y-2">
                            <Camera className="h-8 w-8 mx-auto text-green-500" />
                            <p className="text-sm text-green-600">{selfieFile.name}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelfieFile(null)}
                              className="mt-2"
                            >
                              إزالة الصورة
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 max-w-md mx-auto">
                          <div className="space-y-3 text-center">
                            <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">اختر طريقة إضافة الصورة</p>
                            <div className="flex gap-2 justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCameraOpen(true)}
                                className="flex items-center gap-2"
                              >
                                <Camera className="h-4 w-4" />
                                فتح الكاميرا
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('selfieDocument')?.click()}
                                className="flex items-center gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                رفع صورة
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <input
                        id="selfieDocument"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>جاري الرفع...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">متطلبات الوثائق:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• صورة واضحة للوجه الأمامي للوثيقة</li>
                    <li>• صورة واضحة للوجه الخلفي للوثيقة (إذا كان يحتوي على معلومات)</li>
                    <li>• صورة شخصية (سيلفي) مع حمل الوثيقة</li>
                    <li>• تأكد من وضوح جميع المعلومات وعدم وجود انعكاس للضوء</li>
                    <li>• حجم الملف الأقصى: 5 ميجابايت لكل صورة</li>
                    <li>• الصيغ المدعومة: JPG, PNG, JPEG</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(0)}
                    className="flex-1"
                  >
                    السابق
                  </Button>
                  <Button 
                    onClick={submitDocuments} 
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? "جاري الإرسال..." : "إرسال للمراجعة"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  مراجعة الطلب
                </CardTitle>
                <CardDescription>
                  تم استلام طلبك وهو قيد المراجعة من قبل فريقنا
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">طلبك قيد المراجعة</h3>
                  <p className="text-muted-foreground mb-4">
                    يستغرق التحقق من الهوية عادة من 1-3 أيام عمل. سنقوم بإشعارك فور اكتمال المراجعة.
                  </p>
                  
                  {verification && (
                    <div className="bg-muted/50 p-4 rounded-lg text-left">
                      <h4 className="font-semibold mb-3">ملخص الطلب:</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>الاسم:</strong> {verification.full_name}</p>
                          <p><strong>تاريخ الميلاد:</strong> {verification.date_of_birth}</p>
                          <p><strong>الجنسية:</strong> {verification.nationality}</p>
                        </div>
                        <div>
                          <p><strong>نوع الوثيقة:</strong> {
                            DOCUMENT_TYPES.find(d => d.value === verification.document_type)?.label
                          }</p>
                          <p><strong>رقم الوثيقة:</strong> {verification.document_number}</p>
                          <p><strong>الهاتف:</strong> {verification.phone_number}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">ماذا بعد؟</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• سيقوم فريقنا بمراجعة جميع المعلومات والوثائق المقدمة</li>
                    <li>• قد نطلب وثائق إضافية إذا لزم الأمر</li>
                    <li>• ستتلقى إشعاراً عبر البريد الإلكتروني بنتيجة المراجعة</li>
                    <li>• يمكنك العودة لهذه الصفحة لمتابعة حالة طلبك</li>
                  </ul>
                </div>

                {verification?.status === 'rejected' && verification.verification_notes && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">سبب الرفض:</h4>
                    <p className="text-sm text-red-700">{verification.verification_notes}</p>
                    <Button 
                      variant="outline" 
                      className="mt-3"
                      onClick={() => setCurrentStep(0)}
                    >
                      إعادة تقديم الطلب
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
            </div>
          </section>
          
          <CameraCapture
            isOpen={cameraOpen}
            onClose={() => setCameraOpen(false)}
            onCapture={(file) => setSelfieFile(file)}
            title="التقاط صورة شخصية مع الوثيقة"
          />
        </div>
      </div>
    </>
  );
};

export default Identity;
