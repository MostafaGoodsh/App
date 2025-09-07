import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface SectionIntroductionProps {
  sectionType: string;
}

interface Introduction {
  id: string;
  title: string;
  title_en?: string;
  content: string;
  content_en?: string;
  text_direction: string;
}

const SectionIntroduction = ({ sectionType }: SectionIntroductionProps) => {
  const [introduction, setIntroduction] = useState<Introduction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntroduction();
  }, [sectionType]);

  const fetchIntroduction = async () => {
    try {
      const { data, error } = await supabase
        .from('task_section_introductions')
        .select('*')
        .eq('section_type', sectionType)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setIntroduction(data);
    } catch (error) {
      console.error('Error fetching introduction:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !introduction) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
      <CardContent className="p-6">
        <h2 
          className="text-xl font-bold mb-3 text-primary"
          dir={introduction.text_direction}
        >
          {introduction.title}
        </h2>
        <p 
          className="text-muted-foreground leading-relaxed"
          dir={introduction.text_direction}
        >
          {introduction.content}
        </p>
      </CardContent>
    </Card>
  );
};

export default SectionIntroduction;