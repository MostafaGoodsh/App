import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share } from "lucide-react";
import egyptianCatBg from "@/assets/egyptian-cat-bg.jpg";

interface ReelVideo {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: number;
  likes: number;
  category: string;
}

// Sample data - في التطبيق الحقيقي ستأتي من قاعدة البيانات
const sampleReels: ReelVideo[] = [
  {
    id: '1',
    title: 'تعلم أساسيات البلوك تشين',
    thumbnail: '/lovable-uploads/5965d679-8a52-49ee-9711-9c3a04f7368d.png',
    videoUrl: '#',
    duration: '2:30',
    views: 1250,
    likes: 89,
    category: 'تعليمي'
  },
  {
    id: '2', 
    title: 'استراتيجيات الاستثمار الذكي',
    thumbnail: '/lovable-uploads/45e37627-8629-45b2-ae38-13d37fbeb015.png',
    videoUrl: '#',
    duration: '3:15',
    views: 2100,
    likes: 156,
    category: 'مالي'
  },
  {
    id: '3',
    title: 'قصص نجاح المستثمرين',
    thumbnail: '/lovable-uploads/109a2672-ce6d-4b3b-9e14-10a92facf011.png',
    videoUrl: '#',
    duration: '4:00',
    views: 890,
    likes: 67,
    category: 'إلهام'
  }
];

export function ReelsCard() {
  const [currentReel, setCurrentReel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const currentVideo = sampleReels[currentReel];

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const nextReel = () => {
    setCurrentReel((prev) => (prev + 1) % sampleReels.length);
    setIsPlaying(false);
  };

  const prevReel = () => {
    setCurrentReel((prev) => (prev - 1 + sampleReels.length) % sampleReels.length);
    setIsPlaying(false);
  };

  return (
    <Card 
      className="overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(139,69,19,0.3)), url(${egyptianCatBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-white arabic-text text-right flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white text-xs">
              {sampleReels.length} فيديو
            </Badge>
          </div>
          <span>فيديوهات تعليمية قصيرة</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video Player Area */}
        <div className="relative aspect-[9/16] max-h-96 rounded-lg overflow-hidden bg-black/50 border border-white/20">
          <img
            src={currentVideo.thumbnail}
            alt={currentVideo.title}
            className="w-full h-full object-cover"
          />
          
          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              variant="ghost"
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </Button>
          </div>

          {/* Video Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-end justify-between">
              <div className="text-white text-right flex-1">
                <Badge variant="outline" className="bg-white/20 text-white text-xs mb-2 border-white/40">
                  {currentVideo.category}
                </Badge>
                <h3 className="font-medium text-sm mb-1 arabic-text">{currentVideo.title}</h3>
                <div className="flex items-center justify-end gap-3 text-xs text-white/80">
                  <span>{currentVideo.duration}</span>
                  <span>{currentVideo.views.toLocaleString('ar-SA')} مشاهدة</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-2 ml-3">
                <Button
                  size="sm" 
                  variant="ghost"
                  onClick={toggleMute}
                  className="w-8 h-8 p-0 text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost" 
                  className="w-8 h-8 p-0 text-white hover:bg-white/20"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 text-white hover:bg-white/20"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 text-white hover:bg-white/20"
                >
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={nextReel}
            className="text-white border-white/40 hover:bg-white/20 arabic-text"
          >
            التالي
          </Button>
          
          <div className="flex gap-1">
            {sampleReels.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentReel(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentReel 
                    ? 'bg-white' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={prevReel}
            className="text-white border-white/40 hover:bg-white/20 arabic-text"
          >
            السابق
          </Button>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-center gap-6 text-white/80 text-sm">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{currentVideo.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>24</span>
          </div>
          <div className="flex items-center gap-1">
            <Share className="w-4 h-4" />
            <span>12</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}