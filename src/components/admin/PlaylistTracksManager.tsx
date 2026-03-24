import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Upload, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id?: string;
  title: string;
  audio_url: string;
  duration_seconds: number | null;
  track_order: number;
}

interface Props {
  episodeId: string;
  tracks: Track[];
  onTracksChange: (tracks: Track[]) => void;
}

const PlaylistTracksManager = ({ episodeId, tracks, onTracksChange }: Props) => {
  const [uploading, setUploading] = useState<number | null>(null);

  const addTrack = () => {
    onTracksChange([...tracks, {
      title: '',
      audio_url: '',
      duration_seconds: null,
      track_order: tracks.length,
    }]);
  };

  const updateTrack = (idx: number, field: keyof Track, value: any) => {
    const updated = [...tracks];
    (updated[idx] as any)[field] = value;
    onTracksChange(updated);
  };

  const removeTrack = (idx: number) => {
    const updated = tracks.filter((_, i) => i !== idx);
    updated.forEach((t, i) => t.track_order = i);
    onTracksChange(updated);
  };

  const uploadTrackAudio = async (idx: number, file: File) => {
    setUploading(idx);
    const ext = file.name.split('.').pop();
    const path = `tracks/${Date.now()}_${idx}.${ext}`;
    const { error } = await supabase.storage.from('podcast-audio').upload(path, file);
    if (error) { toast.error(error.message); setUploading(null); return; }
    const { data: urlData } = supabase.storage.from('podcast-audio').getPublicUrl(path);
    updateTrack(idx, 'audio_url', urlData.publicUrl);
    if (!tracks[idx].title) {
      updateTrack(idx, 'title', file.name.replace(/\.[^.]+$/, ''));
    }
    toast.success('تم رفع المقطع');
    setUploading(null);
  };

  const uploadMultipleFiles = async (files: FileList) => {
    setUploading(-1);
    const newTracks: Track[] = [...tracks];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const path = `tracks/${Date.now()}_${newTracks.length}.${ext}`;
      const { error } = await supabase.storage.from('podcast-audio').upload(path, file);
      if (error) { toast.error(`خطأ في رفع ${file.name}`); continue; }
      const { data: urlData } = supabase.storage.from('podcast-audio').getPublicUrl(path);
      newTracks.push({
        title: file.name.replace(/\.[^.]+$/, ''),
        audio_url: urlData.publicUrl,
        duration_seconds: null,
        track_order: newTracks.length,
      });
    }
    onTracksChange(newTracks);
    toast.success(`تم رفع ${files.length} ملف`);
    setUploading(null);
  };

  return (
    <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">قائمة التشغيل ({tracks.length} مقطع)</Label>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && e.target.files.length > 0 && uploadMultipleFiles(e.target.files)}
            />
            <Button type="button" variant="outline" size="sm" asChild>
              <span><Upload className="w-3 h-3 mr-1" />رفع ملفات</span>
            </Button>
          </label>
          <Button type="button" variant="outline" size="sm" onClick={addTrack}>
            <Plus className="w-3 h-3 mr-1" />إضافة مقطع
          </Button>
        </div>
      </div>

      {uploading === -1 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="animate-spin w-4 h-4" /> جاري رفع الملفات...
        </div>
      )}

      {tracks.map((track, idx) => (
        <div key={idx} className="flex items-start gap-2 p-2 bg-background rounded border">
          <GripVertical className="w-4 h-4 mt-2 text-muted-foreground shrink-0" />
          <div className="flex-1 space-y-1">
            <Input
              placeholder="اسم المقطع"
              value={track.title}
              onChange={e => updateTrack(idx, 'title', e.target.value)}
              className="h-8 text-sm"
            />
            <div className="flex gap-1">
              <Input
                placeholder="رابط الصوت"
                value={track.audio_url}
                onChange={e => updateTrack(idx, 'audio_url', e.target.value)}
                className="h-8 text-sm flex-1"
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && uploadTrackAudio(idx, e.target.files[0])}
                />
                <Button type="button" variant="ghost" size="sm" asChild disabled={uploading === idx}>
                  <span>{uploading === idx ? <Loader2 className="animate-spin w-3 h-3" /> : <Upload className="w-3 h-3" />}</span>
                </Button>
              </label>
            </div>
            {track.audio_url && (
              <audio src={track.audio_url} controls className="w-full h-7" />
            )}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => removeTrack(idx)} className="mt-1">
            <Trash2 className="w-3 h-3 text-destructive" />
          </Button>
        </div>
      ))}

      {tracks.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">لا توجد مقاطع - أضف مقاطع أو ارفع ملفات صوتية</p>
      )}
    </div>
  );
};

export default PlaylistTracksManager;
