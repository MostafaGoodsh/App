import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { LanguageWrapper, TextWrapper } from "@/components/ui/language-wrapper";
import { getLanguageClass, getTextDirection } from "@/utils/language";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Plus,
  Upload,
  X,
  Mic
} from "lucide-react";

interface LearningPost {
  id: string;
  title: string;
  content: string;
  media_urls: string[] | null;
  media_type: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  created_by: string;
  tags: string[] | null;
  difficulty_level: string;
  is_published: boolean;
  category: 'crypto' | 'general' | 'divine';
  author_name?: string;
  language?: string;
  text_direction?: string;
  profile?: {
    full_name: string;
  };
}

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  profile?: {
    full_name: string;
  };
}

export default function LearningTimeline({ category = 'crypto' }: { category?: 'crypto' | 'general' | 'divine' }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<LearningPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  // Create post form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState("text");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [tags, setTags] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [postCategory, setPostCategory] = useState(category);
  
  // Comments states
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserLikes();
    }
  }, [user, category]);

  const fetchPosts = async () => {
    try {
      // First get the posts filtered by category and approved status
      const { data: postsData, error: postsError } = await supabase
        .from('learning_content')
        .select(`
          id,
          title,
          content,
          media_urls,
          media_type,
          likes_count,
          comments_count,
          created_at,
          created_by,
          tags,
          difficulty_level,
          is_published,
          category,
          author_name,
          language,
          text_direction
        `)
        .eq('approval_status', 'approved')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Then get profile data for each post
      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          if (post.created_by) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', post.created_by)
              .single();
            
            return {
              ...post,
              category: post.category as 'crypto' | 'general' | 'divine',
              profile: profileData
            };
          }
          return {
            ...post,
            category: post.category as 'crypto' | 'general' | 'divine'
          };
        })
      );

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب المنشورات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('learning_likes')
        .select('content_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setLikedPosts(new Set(data.map(like => like.content_id)));
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `learning/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('learning-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('learning-media')
        .getPublicUrl(filePath);

      return data.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const createPost = async () => {
    if (!user || !title.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان المنشور",
        variant: "destructive"
      });
      return;
    }

    try {
      let mediaUrls: string[] = [];
      
      if (selectedFiles.length > 0) {
        mediaUrls = await uploadFiles(selectedFiles);
      }

      const { error } = await supabase
        .from('learning_content')
        .insert([{
          title,
          content,
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
          media_type: mediaType,
          tags: tags ? tags.split(',').map(tag => tag.trim()) : null,
          difficulty_level: difficulty,
          category: postCategory,
          created_by: user.id,
          is_published: true
        }]);

      if (error) throw error;

      toast({
        title: "تم إنشاء المنشور",
        description: "تم إنشاء المنشور بنجاح"
      });

      // Reset form
      setTitle("");
      setContent("");
      setSelectedFiles([]);
      setTags("");
      setMediaType("text");
      setDifficulty("beginner");
      setShowCreatePost(false);
      
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إنشاء المنشور",
        variant: "destructive"
      });
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const isLiked = likedPosts.has(postId);
      
      if (isLiked) {
        const { error } = await supabase
          .from('learning_likes')
          .delete()
          .eq('content_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from('learning_likes')
          .insert([{
            content_id: postId,
            user_id: user.id
          }]);

        if (error) throw error;
        setLikedPosts(prev => new Set(prev).add(postId));
      }

      // Update posts state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + (isLiked ? -1 : 1) }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      // First get the comments
      const { data: commentsData, error } = await supabase
        .from('learning_comments')
        .select('*')
        .eq('content_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Then get profile data for each comment
      const commentsWithProfiles = await Promise.all(
        (commentsData || []).map(async (comment) => {
          if (comment.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', comment.user_id)
              .single();
            
            return {
              ...comment,
              profile: profileData
            };
          }
          return comment;
        })
      );

      setComments(prev => ({ ...prev, [postId]: commentsWithProfiles || [] }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const addComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;

    try {
      const { error } = await supabase
        .from('learning_comments')
        .insert([{
          content_id: postId,
          user_id: user.id,
          comment: newComment[postId].trim()
        }]);

      if (error) throw error;

      setNewComment(prev => ({ ...prev, [postId]: "" }));
      fetchComments(postId);
      
      // Update comments count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => {
      const newState = { ...prev, [postId]: !prev[postId] };
      if (newState[postId] && !comments[postId]) {
        fetchComments(postId);
      }
      return newState;
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const renderMedia = (post: LearningPost) => {
    if (!post.media_urls || post.media_urls.length === 0) return null;

    return (
      <div className="mt-4 space-y-2">
        {post.media_urls.map((url, index) => {
          const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.avi') || url.includes('.mov');
          const isAudio = url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg') || url.includes('.m4a');
          
          if (isVideo) {
            return (
              <video 
                key={index}
                src={url} 
                controls 
                className="w-full rounded-lg max-h-96"
              />
            );
          } else if (isAudio) {
            return (
              <audio 
                key={index}
                src={url} 
                controls 
                className="w-full"
              />
            );
          } else {
            return (
              <img 
                key={index}
                src={url} 
                alt="Post media" 
                className="w-full rounded-lg max-h-96 object-cover"
              />
            );
          }
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Create Post Button */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogTrigger asChild>
          <Button className="w-full mb-6" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            {t("إنشاء منشور جديد", "Create new post")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("إنشاء منشور تعليمي", "Create educational post")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="عنوان المنشور"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <Textarea
              placeholder="محتوى المنشور"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />

            <Select value={mediaType} onValueChange={setMediaType}>
              <SelectTrigger>
                <SelectValue placeholder="نوع المحتوى" />
              </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">نص</SelectItem>
                  <SelectItem value="image">صورة</SelectItem>
                  <SelectItem value="video">فيديو</SelectItem>
                  <SelectItem value="audio">صوت</SelectItem>
                  <SelectItem value="mixed">مختلط</SelectItem>
                </SelectContent>
            </Select>

            {(mediaType === "image" || mediaType === "video" || mediaType === "audio" || mediaType === "mixed") && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">رفع الملفات</label>
                <Input
                  type="file"
                  multiple
                  accept={
                    mediaType === "image" ? "image/*" : 
                    mediaType === "video" ? "video/*" : 
                    mediaType === "audio" ? "audio/*" :
                    "image/*,video/*,audio/*"
                  }
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setSelectedFiles(prev => [...prev, ...files]);
                  }}
                />
                
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="مستوى الصعوبة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">مبتدئ</SelectItem>
                <SelectItem value="intermediate">متوسط</SelectItem>
                <SelectItem value="advanced">متقدم</SelectItem>
              </SelectContent>
            </Select>

            <Select value={postCategory} onValueChange={(value) => setPostCategory(value as 'crypto' | 'general' | 'divine')}>
              <SelectTrigger>
                <SelectValue placeholder="القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crypto">مالي Crypto</SelectItem>
                <SelectItem value="general">عام General</SelectItem>
                <SelectItem value="divine">ديني Divine</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="العلامات (مفصولة بفواصل)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />

            <Button onClick={createPost} className="w-full">
              نشر المحتوى
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Posts Timeline */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {post.profile?.full_name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {post.author_name || post.profile?.full_name || 'مؤلف مجهول'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('ar-SA')}
                      {post.language && post.language !== 'ar' && (
                        <span className="ml-2 text-xs">
                          • {post.language === 'en' ? 'English' : post.language === 'both' ? 'ثنائي اللغة' : post.language}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{post.difficulty_level}</Badge>
                  {post.media_type !== 'text' && (
                    <Badge variant="outline">
                      {post.media_type === 'image' ? <ImageIcon className="h-3 w-3" /> :
                       post.media_type === 'video' ? <Video className="h-3 w-3" /> :
                       post.media_type === 'audio' ? <Mic className="h-3 w-3" /> :
                       <FileText className="h-3 w-3" />}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <LanguageWrapper 
                  language={post.language as "ar" | "en"}
                  textDirection={post.text_direction as "rtl" | "ltr"}
                >
                  <h3 className="font-bold text-lg mb-2">
                    {post.title}
                  </h3>
                  {post.content && (
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {post.content}
                    </p>
                  )}
                </LanguageWrapper>
              </div>

              {renderMedia(post)}

              {post.tags && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Interaction Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={likedPosts.has(post.id) ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                    {post.likes_count}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments_count}
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    مشاركة
                  </Button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="border-t pt-4 space-y-4">
                  {user && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="اكتب تعليقاً..."
                        value={newComment[post.id] || ""}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                      />
                      <Button onClick={() => addComment(post.id)}>إرسال</Button>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {comment.profile?.full_name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-sm">{comment.profile?.full_name || 'مجهول'}</p>
                            <p className="text-sm">{comment.comment}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(comment.created_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}