import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  sections?: any;
  background_gradient: string;
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

  return (
    <>
      <Helmet>
        <title>{data.page_title || data.title} - منصة مصر</title>
        <meta name="description" content={data.description || data.page_title} />
      </Helmet>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة للرئيسية
            </Button>
          </Link>
          
          <div 
            className="rounded-lg p-8 text-center mb-6"
            style={{ background: data.background_gradient }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              {data.page_title || data.title}
            </h1>
            {data.description && (
              <p className="text-white/90 text-lg">{data.description}</p>
            )}
          </div>
        </div>

        {/* Content */}
        {data.page_content ? (
          <Card>
            <CardContent className="p-6 prose prose-lg max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: data.page_content }} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>قريباً</CardTitle>
              <CardDescription>
                المحتوى قيد الإعداد وسيتم نشره قريباً
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Sections */}
        {data.sections && Array.isArray(data.sections) && data.sections.length > 0 && (
          <div className="mt-8 space-y-6">
            {data.sections.map((section: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </CardHeader>
                {section.content && (
                  <CardContent>
                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
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
