-- إنشاء جدول للاستدعاءات النشطة (استدعاء واحد فقط في أي وقت)
CREATE TABLE public.active_callouts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    personality_name TEXT NOT NULL,
    personality_title TEXT,
    personality_description TEXT,
    personality_image_url TEXT,
    callout_text TEXT NOT NULL DEFAULT 'العقيدة و الأخلاق هي نقطة تميزنا و تفردنا',
    contact_link TEXT DEFAULT '#',
    contact_button_text TEXT DEFAULT 'تواصل مع الشخصية',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- تمكين RLS
ALTER TABLE public.active_callouts ENABLE ROW LEVEL SECURITY;

-- سياسات الحماية
CREATE POLICY "Admins can manage active callouts" 
ON public.active_callouts 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active callouts" 
ON public.active_callouts 
FOR SELECT 
USING (true);

-- تريجر لتحديث updated_at
CREATE TRIGGER update_active_callouts_updated_at
BEFORE UPDATE ON public.active_callouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- دالة لإدارة الاستدعاءات (نقل النشط للأرشيف وإضافة جديد)
CREATE OR REPLACE FUNCTION public.create_new_callout(
    p_personality_name TEXT,
    p_personality_title TEXT DEFAULT NULL,
    p_personality_description TEXT DEFAULT NULL,
    p_personality_image_url TEXT DEFAULT NULL,
    p_callout_text TEXT DEFAULT 'العقيدة و الأخلاق هي نقطة تميزنا و تفردنا',
    p_contact_link TEXT DEFAULT '#',
    p_contact_button_text TEXT DEFAULT 'تواصل مع الشخصية'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    v_current_callout RECORD;
    v_new_callout_id UUID;
BEGIN
    -- التحقق من صلاحيات الإدارة
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;
    
    -- الحصول على الاستدعاء النشط الحالي
    SELECT * INTO v_current_callout 
    FROM public.active_callouts 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- إذا كان هناك استدعاء نشط، نقله إلى الأرشيف
    IF v_current_callout.id IS NOT NULL THEN
        INSERT INTO public.callout_personalities (
            name, title, description, image_url, category, 
            is_featured, display_order, is_active,
            contact_link, contact_button_text, created_by
        ) VALUES (
            v_current_callout.personality_name,
            v_current_callout.personality_title,
            v_current_callout.personality_description,
            v_current_callout.personality_image_url,
            'public_figure',
            false, -- لم يعد مميز
            0,
            true, -- نشط في الأرشيف
            v_current_callout.contact_link,
            v_current_callout.contact_button_text,
            v_current_callout.created_by
        );
        
        -- حذف الاستدعاء النشط الحالي
        DELETE FROM public.active_callouts WHERE id = v_current_callout.id;
    END IF;
    
    -- إضافة الاستدعاء الجديد
    INSERT INTO public.active_callouts (
        personality_name, personality_title, personality_description, 
        personality_image_url, callout_text, contact_link, 
        contact_button_text, created_by
    ) VALUES (
        p_personality_name, p_personality_title, p_personality_description,
        p_personality_image_url, p_callout_text, p_contact_link,
        p_contact_button_text, auth.uid()
    ) RETURNING id INTO v_new_callout_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'تم إنشاء الاستدعاء الجديد بنجاح',
        'new_callout_id', v_new_callout_id,
        'archived_previous', v_current_callout.id IS NOT NULL
    );
END;
$function$;