import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LearningContent {
  id: string;
  title: string;
  content: string;
  content_type: string;
  difficulty_level: string;
  tags: string[];
  created_at: string;
}

const Learning = () => {
  const [content, setContent] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState(true);
  const canonical = typeof window !== "undefined" ? window.location.href : "/learning";

  useEffect(() => {
    fetchPublishedContent();
  }, []);

  const fetchPublishedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-primary/10 text-primary border-primary/20';
      case 'intermediate': return 'bg-accent/10 text-accent border-accent/20';
      case 'advanced': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <Helmet>
        <title>التعلم — منصة تعليمية تفاعلية</title>
        <meta name="description" content="التعلم (Learning) لمحتوى تعليمي تفاعلي حول الأصول الرقمية." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <section className="container mx-auto px-4 py-16">
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6">التعلم (Learning)</h1>
        <p className="text-muted-foreground max-w-2xl mb-8">
          اكتشف محتوى تعليمي تفاعلي حول الأصول الرقمية والعملات المشفرة.
        </p>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : content.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">لا يوجد محتوى منشور حالياً.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.map((item) => (
              <Card key={item.id} className="group hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                    <Badge variant="outline" className={getDifficultyColor(item.difficulty_level)}>
                      {item.difficulty_level === 'beginner' ? 'مبتدئ' : 
                       item.difficulty_level === 'intermediate' ? 'متوسط' : 'متقدم'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {item.content_type === 'article' ? 'مقال' : 
                     item.content_type === 'video' ? 'فيديو' : 'دورة'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {item.content?.substring(0, 150)}...
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(item.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Learning;
