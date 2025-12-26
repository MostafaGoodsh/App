import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Configure DOMPurify to allow safe HTML elements for content
const sanitizeHTML = (dirty: string) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'img', 'video', 'iframe', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel', 'width', 'height', 'title', 'dir', 'controls', 'allowfullscreen', 'frameborder'],
    ALLOW_DATA_ATTR: false,
  });
};
interface RoadmapData {
  id: string;
  title: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  page_title?: string;
  page_title_en?: string;
  page_content?: string;
  page_content_en?: string;
  page_cover_image?: string;
  sections?: any;
  background_gradient: string;
  font_size?: string;
  font_family?: string;
  font_weight?: string;
  title_font_size?: string;
  content_font_size?: string;
  external_widget_url?: string;
  widget_type?: string;
  widget_config?: any;
}

const RoadmapDetail = () => {
  const { slug } = useParams();
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: roadmapData, error } = await supabase
        .from('roadmap_cards')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setData(roadmapData);
    } catch (error) {
      console.error('Error fetching roadmap data:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            لم يتم العثور على الصفحة المطلوبة
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getFontSize = (size?: string) => {
    switch (size) {
      case 'small': return '0.875rem';
      case 'medium': return '1rem';
      case 'large': return '1.125rem';
      case 'xlarge': return '1.5rem';
      default: return '1rem';
    }
  };

  const renderWidget = () => {
    if (!data.widget_type || data.widget_type === 'none' || !data.external_widget_url) return null;

    switch (data.widget_type) {
      case 'dexscreener':
        return (
          <Card className="bg-black/60 backdrop-blur-sm border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white">مخطط DexScreener</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe
                src={data.external_widget_url}
                className="w-full h-96 rounded-lg"
                title="DexScreener Chart"
              />
            </CardContent>
          </Card>
        );
      case 'pumpfun':
        return (
          <Card className="bg-black/60 backdrop-blur-sm border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Pump.fun Token</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe
                src={data.external_widget_url}
                className="w-full h-96 rounded-lg"
                title="Pump.fun Token"
              />
            </CardContent>
          </Card>
        );
      case 'custom_embed':
        return (
          <Card className="bg-black/60 backdrop-blur-sm border-white/20 mb-8">
            <CardContent className="pt-6">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(data.external_widget_url) }} />
            </CardContent>
          </Card>
        );
      case 'iframe':
        return (
          <Card className="bg-black/60 backdrop-blur-sm border-white/20 mb-8">
            <CardContent className="pt-6">
              <iframe
                src={data.external_widget_url}
                className="w-full h-96 rounded-lg"
                title="External Widget"
              />
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>{data.page_title || data.title} - منصة مصر</title>
        <meta name="description" content={data.description || data.page_title} />
      </Helmet>

      <main 
        className="container mx-auto px-4 py-8 max-w-4xl bg-cover bg-center bg-fixed min-h-screen"
        style={{ 
          backgroundImage: data.page_cover_image 
            ? `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('${data.page_cover_image}')`
            : `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('/lovable-uploads/egyptian-hieroglyphs-bg.jpg')`,
          fontFamily: data.font_family || 'Cairo',
          fontWeight: data.font_weight || 'normal',
          fontSize: getFontSize(data.font_size),
        }}
      >
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4 text-white hover:bg-white/10">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة للرئيسية
            </Button>
          </Link>
          
          <div 
            className="rounded-lg p-8 text-center mb-6 bg-cover bg-center relative overflow-hidden"
            style={{ 
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/lovable-uploads/egyptian-golden-snake-bg.jpg')`,
            }}
          >
          <div className="relative z-10">
            {data.page_title_en && (
              <h1 
                className="font-cairo font-bold text-primary mb-3 drop-shadow-lg"
                style={{ fontSize: getFontSize(data.title_font_size || 'xlarge') }}
              >
                {data.page_title_en}
              </h1>
            )}
            <p 
              className="font-cairo text-white mb-2 drop-shadow-lg"
              style={{ fontSize: getFontSize(data.title_font_size || 'large') }}
            >
              {data.page_title || data.title}
            </p>
            {data.description_en && (
              <p className="text-white/90 drop-shadow-lg mb-1">{data.description_en}</p>
            )}
            {data.description && (
              <p className="text-white/80 drop-shadow-lg">{data.description}</p>
            )}
          </div>
          </div>
        </div>

        {/* Widget Section */}
        {renderWidget()}

        {/* Content */}
        {data.page_content ? (
          <div 
            className="text-white prose prose-lg max-w-none prose-invert 
              [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg 
              [&_video]:max-w-full [&_video]:h-auto [&_video]:rounded-lg 
              [&_iframe]:max-w-full [&_iframe]:aspect-video
              [&_.bg-card]:bg-black/60 [&_.bg-card]:backdrop-blur-sm [&_.bg-card]:border-white/20
              [&_.text-muted-foreground]:text-white/70
              [&_.border]:border-white/20
              [&_.border-primary\\/30]:border-primary/30
              [&_.arabic-text]:text-right [&_.arabic-text]:font-cairo" 
            style={{ fontSize: getFontSize(data.content_font_size) }}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(data.page_content) }}
          />
        ) : (
          <Card className="bg-black/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">قريباً</CardTitle>
              <CardDescription className="text-white/70">
                المحتوى قيد الإعداد وسيتم نشره قريباً
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Sections */}
        {data.sections && Array.isArray(data.sections) && data.sections.length > 0 && (
          <div className="mt-8 space-y-6">
            {data.sections.map((section: any, index: number) => (
              <Card key={index} className="bg-black/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="font-cairo text-white">{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription className="text-white/70">{section.description}</CardDescription>
                  )}
                </CardHeader>
                {section.content && (
                  <CardContent>
                    <div 
                      className="text-white prose prose-invert [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_video]:max-w-full [&_video]:h-auto [&_video]:rounded-lg [&_iframe]:max-w-full [&_iframe]:aspect-video" 
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(section.content) }}
                    />
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default RoadmapDetail;
