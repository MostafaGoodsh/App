import { Helmet } from 'react-helmet-async';
import { usePodcast, PodcastEpisode } from '@/hooks/usePodcast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Pause, Headphones, Radio, Music } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const typeIcons: Record<string, React.ReactNode> = {
  podcast: <Headphones className="w-4 h-4" />,
  radio: <Radio className="w-4 h-4" />,
  music: <Music className="w-4 h-4" />,
};

const Podcast = () => {
  const { t, language } = useLanguage();
  const { episodes, loading, currentEpisode, isPlaying, play, pause } = usePodcast();
  const isAr = language === 'ar' || language === 'both';

  const getTitle = (ep: PodcastEpisode) => (!isAr && ep.title_en) ? ep.title_en : ep.title;
  const getDesc = (ep: PodcastEpisode) => (!isAr && ep.description_en) ? ep.description_en : ep.description;

  const podcasts = episodes.filter(e => e.episode_type === 'podcast');
  const radioEps = episodes.filter(e => e.episode_type === 'radio');
  const musicEps = episodes.filter(e => e.episode_type === 'music');

  const EpisodeCard = ({ ep }: { ep: PodcastEpisode }) => {
    const isCurrent = currentEpisode?.id === ep.id;
    return (
      <Card className={`transition-all ${isCurrent ? 'border-primary ring-1 ring-primary/30' : 'border-border/50'}`}>
        <CardContent className="p-4 flex items-center gap-3">
          {ep.thumbnail_url ? (
            <img src={ep.thumbnail_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {typeIcons[ep.episode_type] || <Headphones className="w-5 h-5 text-primary" />}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{getTitle(ep)}</p>
            {getDesc(ep) && <p className="text-xs text-muted-foreground truncate mt-0.5">{getDesc(ep)}</p>}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {ep.episode_type}
              </Badge>
              {ep.duration_seconds && (
                <span className="text-[10px] text-muted-foreground">
                  {Math.floor(ep.duration_seconds / 60)}:{(ep.duration_seconds % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
          </div>
          <Button
            variant={isCurrent && isPlaying ? 'default' : 'outline'}
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            onClick={() => isCurrent && isPlaying ? pause() : play(ep)}
          >
            {isCurrent && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8" /></div>;

  return (
    <div className="container mx-auto px-4 py-6 pb-24" dir={isAr ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('بودكاست وراديو', 'Podcast & Radio')} | MS-RA</title>
      </Helmet>

      <div className="text-center mb-6">
        <h1 className="font-cairo text-2xl font-bold mb-2">{t('بودكاست وراديو', 'Podcast & Radio')}</h1>
        <p className="text-muted-foreground text-sm">{t('استمع للمحتوى الصوتي والبودكاست والراديو', 'Listen to podcasts, radio and audio content')}</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="all">{t('الكل', 'All')}</TabsTrigger>
          <TabsTrigger value="podcast">{t('بودكاست', 'Podcast')}</TabsTrigger>
          <TabsTrigger value="radio">{t('راديو', 'Radio')}</TabsTrigger>
          <TabsTrigger value="music">{t('موسيقى', 'Music')}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {episodes.length === 0 && <p className="text-center text-muted-foreground py-8">{t('لا توجد حلقات بعد', 'No episodes yet')}</p>}
          {episodes.map(ep => <EpisodeCard key={ep.id} ep={ep} />)}
        </TabsContent>
        <TabsContent value="podcast" className="space-y-3">
          {podcasts.map(ep => <EpisodeCard key={ep.id} ep={ep} />)}
        </TabsContent>
        <TabsContent value="radio" className="space-y-3">
          {radioEps.map(ep => <EpisodeCard key={ep.id} ep={ep} />)}
        </TabsContent>
        <TabsContent value="music" className="space-y-3">
          {musicEps.map(ep => <EpisodeCard key={ep.id} ep={ep} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Podcast;
