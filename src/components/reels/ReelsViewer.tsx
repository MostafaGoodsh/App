import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, MessageCircle, Share, Volume2, VolumeX, ArrowUp, ArrowDown, Edit3, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ReelsContent {
  id: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  video_url: string;
  thumbnail_url: string;
  view_count: number;
  category_id?: string;
  likes_count?: number;
  comments_count?: number;
}

interface ReelsCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  is_active: boolean;
  display_order: number;
}

export const ReelsViewer = () => {
  const [reelsContent, setReelsContent] = useState<ReelsContent[]>([]);
  const [categories, setCategories] = useState<ReelsCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredContent, setFilteredContent] = useState<ReelsContent[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchData();
    // Get category from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  useEffect(() => {
    // تصفية المحتوى حسب القسم المحدد
    if (selectedCategory) {
      const filtered = reelsContent.filter(reel => reel.category_id === selectedCategory);
      setFilteredContent(filtered);
    } else {
      setFilteredContent(reelsContent);
    }
    setCurrentVideoIndex(0);
  }, [selectedCategory, reelsContent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return; // منع التنقل أثناء التحرير
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowDown':
          e.preventDefault();
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isEditing) return; // منع التنقل أثناء التحرير
      
      e.preventDefault();
      if (e.deltaY > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isEditing) return; // منع التنقل أثناء التحرير
      
      const touch = e.touches[0];
      setTouchStart(touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart || isEditing) return;
      
      const touch = e.changedTouches[0];
      const diff = touchStart - touch.clientY;
      
      if (Math.abs(diff) > 50) { // minimum swipe distance
        if (diff > 0) {
          goToNext();
        } else {
          goToPrevious();
        }
      }
      setTouchStart(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentVideoIndex, filteredContent.length, touchStart, isEditing]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // جلب الأقسام
      const { data: categoriesData } = await supabase
        .from('reels_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // جلب الفيديوهات مع عدد اللايكات والتعليقات
      const { data, error } = await supabase
        .from('reels_content')
        .select(`
          *,
          likes_count:reels_likes(count),
          comments_count:reels_comments(count)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      const processedData = data?.map(reel => ({
        ...reel,
        likes_count: reel.likes_count?.[0]?.count || 0,
        comments_count: reel.comments_count?.[0]?.count || 0
      })) || [];
      setReelsContent(processedData);

      // Load user's liked videos if authenticated
      if (user) {
        const { data: likesData } = await supabase
          .from('reels_likes')
          .select('reel_id')
          .eq('user_id', user.id);
        
        if (likesData) {
          setLikedVideos(new Set(likesData.map(like => like.reel_id)));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToNext = () => {
    if (isEditing) return; // منع التنقل أثناء التحرير
    if (currentVideoIndex < filteredContent.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      incrementViewCount(filteredContent[currentVideoIndex + 1]);
    }
  };

  const goToPrevious = () => {
    if (isEditing) return; // منع التنقل أثناء التحرير
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const incrementViewCount = async (reel: ReelsContent) => {
    try {
      await supabase
        .from('reels_content')
        .update({ view_count: reel.view_count + 1 })
        .eq('id', reel.id);
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const handleVideoClick = () => {
    if (!isEditing) {
      togglePlayPause();
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play();
      }
    }
  };

  const handleEditClick = () => {
    if (!isAdmin) {
      toast({
        title: "غير مسموح",
        description: "هذه الميزة متاحة للإدارة فقط",
        variant: "destructive"
      });
      return;
    }
    const currentReel = filteredContent[currentVideoIndex];
    setEditTitle(currentReel.title);
    setEditDescription(currentReel.description);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      const currentReel = filteredContent[currentVideoIndex];
      const { error } = await supabase
        .from('reels_content')
        .update({ 
          title: editTitle, 
          description: editDescription 
        })
        .eq('id', currentReel.id);

      if (error) throw error;

      // تحديث البيانات المحلية
      const updatedContent = [...reelsContent];
      const originalIndex = updatedContent.findIndex(reel => reel.id === currentReel.id);
      if (originalIndex !== -1) {
        updatedContent[originalIndex] = {
          ...currentReel,
          title: editTitle,
          description: editDescription
        };
        setReelsContent(updatedContent);
      }
      setIsEditing(false);
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث العنوان والوصف",
      });
    } catch (error) {
      console.error('Error updating reel:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ التغييرات",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditDescription('');
  };

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "قم بتسجيل الدخول أولاً للتفاعل مع الفيديوهات",
        variant: "destructive"
      });
      return;
    }

    const currentReel = filteredContent[currentVideoIndex];
    const isLiked = likedVideos.has(currentReel.id);

    try {
      if (isLiked) {
        // إلغاء الإعجاب
        await supabase
          .from('reels_likes')
          .delete()
          .eq('reel_id', currentReel.id)
          .eq('user_id', user.id);
        
        setLikedVideos(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentReel.id);
          return newSet;
        });

        // تحديث العدد محلياً
        setFilteredContent(prev => prev.map(reel => 
          reel.id === currentReel.id 
            ? { ...reel, likes_count: (reel.likes_count || 0) - 1 }
            : reel
        ));
      } else {
        // إضافة إعجاب
        await supabase
          .from('reels_likes')
          .insert({ reel_id: currentReel.id, user_id: user.id });
        
        setLikedVideos(prev => new Set([...prev, currentReel.id]));

        // تحديث العدد محلياً
        setFilteredContent(prev => prev.map(reel => 
          reel.id === currentReel.id 
            ? { ...reel, likes_count: (reel.likes_count || 0) + 1 }
            : reel
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التفاعل مع الفيديو",
        variant: "destructive"
      });
    }
  };

  const handleShowComments = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "قم بتسجيل الدخول أولاً لمشاهدة التعليقات",
        variant: "destructive"
      });
      return;
    }

    const currentReel = filteredContent[currentVideoIndex];
    setShowComments(true);

    try {
      const { data, error } = await supabase
        .from('reels_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('reel_id', currentReel.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    const currentReel = filteredContent[currentVideoIndex];
    
    try {
      const { error } = await supabase
        .from('reels_comments')
        .insert({
          reel_id: currentReel.id,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      toast({
        title: "تم إضافة التعليق",
        description: "تم إضافة تعليقك بنجاح"
      });

      // إعادة تحميل التعليقات
      handleShowComments();

      // تحديث عدد التعليقات محلياً
      setFilteredContent(prev => prev.map(reel => 
        reel.id === currentReel.id 
          ? { ...reel, comments_count: (reel.comments_count || 0) + 1 }
          : reel
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة التعليق",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    const currentReel = filteredContent[currentVideoIndex];
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentReel.title,
          text: currentReel.description,
          url: window.location.href + `?video=${currentReel.id}`
        });
      } catch (error) {
        console.log('Share canceled');
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href + `?video=${currentReel.id}`);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رابط الفيديو إلى الحافظة"
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (filteredContent.length === 0 && !loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        {categories.length > 0 && (
          <div className="absolute top-4 left-4 right-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="text-sm"
              >
                الكل
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-sm"
                >
                  {category.title}
                </Button>
              ))}
            </div>
          </div>
        )}
        <p className="text-lg text-muted-foreground mt-16">لا توجد فيديوهات متاحة في هذا القسم</p>
      </div>
    );
  }

  const currentReel = filteredContent[currentVideoIndex];

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full bg-black overflow-hidden relative"
    >
      {/* Categories Navigation */}
      {categories.length > 0 && !isEditing && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="text-xs bg-black/40 text-white border-white/20 hover:bg-black/60"
            >
              الكل
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs bg-black/40 text-white border-white/20 hover:bg-black/60"
              >
                {category.title}
              </Button>
            ))}
          </div>
        </div>
      )}
      {/* Video Container */}
      <div className="relative h-full w-full flex items-center justify-center">
        <video
          ref={videoRef}
          src={currentReel.video_url}
          className="h-full w-full object-contain max-h-[100dvh]"
          onClick={handleVideoClick}
          onLoadedData={handleVideoLoad}
          onEnded={goToNext}
          autoPlay
          muted={isMuted}
          playsInline
          loop={false}
        />

        {/* Overlay Controls - مخفي أثناء التحرير */}
        {!isEditing && (
          <div className="absolute inset-0 flex">
            {/* Left side - tap to go back */}
            <div 
              className="flex-1 flex items-center justify-start pl-4 cursor-pointer"
              onClick={goToPrevious}
              style={{ background: 'transparent' }}
            >
              {currentVideoIndex > 0 && (
                <ArrowUp className="w-8 h-8 text-white/60 opacity-0 hover:opacity-100 transition-opacity" />
              )}
            </div>

            {/* Center - play/pause */}
            <div 
              className="flex-1 flex items-center justify-center cursor-pointer"
              onClick={togglePlayPause}
            >
              {!isPlaying && (
                <Play className="w-16 h-16 text-white/80 fill-white/80" />
              )}
            </div>

            {/* Right side - tap to go forward */}
            <div 
              className="flex-1 flex items-center justify-end pr-4 cursor-pointer"
              onClick={goToNext}
              style={{ background: 'transparent' }}
            >
              {currentVideoIndex < filteredContent.length - 1 && (
                <ArrowDown className="w-8 h-8 text-white/60 opacity-0 hover:opacity-100 transition-opacity" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Side Controls */}
      <div className="absolute right-4 bottom-20 flex flex-col gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-black/20 text-white hover:bg-black/40"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </Button>

        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full bg-black/20 text-white hover:bg-black/40 ${
              likedVideos.has(currentReel.id) ? 'text-red-500' : ''
            }`}
            onClick={handleLikeToggle}
          >
            <Heart className={`w-6 h-6 ${likedVideos.has(currentReel.id) ? 'fill-red-500' : ''}`} />
          </Button>
          <span className="text-white text-xs mt-1">
            {currentReel.likes_count || 0}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={handleShowComments}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          <span className="text-white text-xs mt-1">
            {currentReel.comments_count || 0}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-black/20 text-white hover:bg-black/40"
          onClick={handleShare}
        >
          <Share className="w-6 h-6" />
        </Button>
      </div>

      {/* Video Info */}
      <div className="absolute bottom-4 left-4 right-20 text-white">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-black/50 border-white/20 text-white placeholder:text-white/60"
              placeholder="العنوان"
              dir="rtl"
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="bg-black/50 border-white/20 text-white placeholder:text-white/60 resize-none"
              placeholder="الوصف"
              rows={3}
              dir="rtl"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 ml-1" />
                حفظ
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <X className="w-4 h-4 ml-1" />
                إلغاء
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-lg mb-2 font-cairo flex-1">
                {currentReel.title}
              </h3>
              {isAdmin && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditClick}
                  className="text-white/80 hover:bg-white/10 p-1 ml-2"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-sm opacity-80 font-cairo leading-relaxed">
              {currentReel.description}
            </p>
            <div className="mt-2 text-xs opacity-60">
              {currentReel.view_count} مشاهدة • {currentReel.likes_count || 0} إعجاب
            </div>
          </>
        )}
      </div>
      
      {/* Comments Modal */}
      {showComments && (
        <div className="absolute inset-0 bg-black/80 flex items-end justify-center z-20">
          <div className="bg-white rounded-t-xl w-full max-w-md h-2/3 flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">التعليقات</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={comment.profiles?.avatar_url || '/placeholder-avatar.png'}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{comment.profiles?.full_name || 'مستخدم'}</div>
                    <div className="text-sm text-muted-foreground">{comment.content}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(comment.created_at).toLocaleString('ar')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتب تعليق..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button onClick={handleAddComment} size="sm">
                إرسال
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Progress indicator */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
        {filteredContent.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full transition-colors duration-300 ${
              index === currentVideoIndex 
                ? 'bg-white' 
                : index < currentVideoIndex 
                  ? 'bg-white/50' 
                  : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-4 right-4">
        <div className="text-white text-sm bg-black/40 px-3 py-1 rounded-full">
          {currentVideoIndex + 1} / {filteredContent.length}
        </div>
      </div>

      {/* Navigation Hints - مخفي أثناء التحرير */}
      {!isEditing && (
        <>
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white/40 text-xs">
            {currentVideoIndex > 0 && "انقر للسابق"}
          </div>
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white/40 text-xs">
            {currentVideoIndex < filteredContent.length - 1 && "انقر للتالي"}
          </div>
        </>
      )}
    </div>
  );
};