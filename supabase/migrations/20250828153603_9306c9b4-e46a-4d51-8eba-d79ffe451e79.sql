-- Fix security warnings by adding search_path to functions

-- 1. Fix update_likes_count function
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.learning_content 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.learning_content 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 2. Fix update_comments_count function
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.learning_content 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.learning_content 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;