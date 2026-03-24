import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, Upload, ListMusic } from 'lucide-react';
import { toast } from 'sonner';
import PlaylistTracksManager from './PlaylistTracksManager';

interface Episode {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  audio_url: string;
  thumbnail_url: string | null;
  episode_type: string;
  duration_seconds: number | null;
  is_active: boolean;
  is_featured: boolean;
  is_background_audio: boolean;
  display_order: number;
}

interface Track {
  id?: string;
  title: string;
  audio_url: string;
  duration_seconds: number | null;
  track_order: number;
}

const emptyForm = {
  title: '', title_en: '', description: '', description_en: '',
  audio_url: '', thumbnail_url: '', episode_type: 'podcast',
  duration_seconds: null as number | null,
  is_active: true, is_featured: false, is_background_audio: false, display_order: 0,
};

const PodcastManagement = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [trackCounts, setTrackCounts] = useState<Record<string, number>>({});

  const fetchEpisodes = async () => {
    const { data } = await supabase.from('podcast_episodes').select('*').order('display_order');
    setEpisodes((data as Episode[]) || []);
    setLoading(false);
    
    // Fetch track counts
    if (data) {
      const { data: countData } = await supabase
        .from('playlist_tracks')
        .select('episode_id');
      if (countData) {
        const counts: Record<string, number> = {};
        countData.forEach((t: any) => { counts[t.episode_id] = (counts[t.episode_id] || 0) + 1; });
        setTrackCounts(counts);
      }
    }
  };

  useEffect(() => { fetchEpisodes(); }, []);

  const fetchTracks = async (episodeId: string) => {
    const { data } = await supabase
      .from('playlist_tracks')
      .select('*')
      .eq('episode_id', episodeId)
      .order('track_order');
    setTracks((data as Track[]) || []);
  };

  const uploadAudio = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('podcast-audio').upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('podcast-audio').getPublicUrl(path);
    setForm(f => ({ ...f, audio_url: urlData.publicUrl }));
    toast.success('تم رفع الملف الصوتي');
    setUploading(false);
  };

  const uploadThumbnail = async (file: File) => {
    const ext = file.name.split('.').pop();
    const path = `thumbnails/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('podcast-audio').upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data: urlData } = supabase.storage.from('podcast-audio').getPublicUrl(path);
    setForm(f => ({ ...f, thumbnail_url: urlData.publicUrl }));
    toast.success('تم رفع الصورة');
  };

  const saveTracks = async (episodeId: string) => {
    // Delete existing tracks
    await supabase.from('playlist_tracks').delete().eq('episode_id', episodeId);
    
    // Insert new tracks
    if (tracks.length > 0) {
      const trackData = tracks
        .filter(t => t.title && t.audio_url)
        .map((t, i) => ({
          episode_id: episodeId,
          title: t.title,
          audio_url: t.audio_url,
          duration_seconds: t.duration_seconds,
          track_order: i,
        }));
      if (trackData.length > 0) {
        await supabase.from('playlist_tracks').insert(trackData as any);
      }
    }
  };

  const handleSave = async () => {
    if (!form.title || (!form.audio_url && tracks.length === 0)) {
      toast.error('العنوان مطلوب، وكذلك ملف صوتي أو مقاطع في القائمة');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      audio_url: form.audio_url || (tracks.length > 0 ? tracks[0].audio_url : ''),
      thumbnail_url: form.thumbnail_url || null,
      duration_seconds: form.duration_seconds || null,
    };

    let error;
    let episodeId = editingId;
    if (editingId) {
      ({ error } = await supabase.from('podcast_episodes').update(payload as any).eq('id', editingId));
    } else {
      const { data, error: insertError } = await supabase.from('podcast_episodes').insert(payload as any).select('id').single();
      error = insertError;
      if (data) episodeId = data.id;
    }
    
    if (error) { toast.error(error.message); setSaving(false); return; }
    
    // Save tracks
    if (episodeId) await saveTracks(episodeId);
    
    toast.success(editingId ? 'تم التحديث' : 'تمت الإضافة');
    setDialogOpen(false); setEditingId(null); setForm(emptyForm); setTracks([]); fetchEpisodes();
    setSaving(false);
  };

  const handleEdit = async (ep: Episode) => {
    setEditingId(ep.id);
    setForm({
      title: ep.title, title_en: ep.title_en || '', description: ep.description || '',
      description_en: ep.description_en || '', audio_url: ep.audio_url,
      thumbnail_url: ep.thumbnail_url || '', episode_type: ep.episode_type,
      duration_seconds: ep.duration_seconds, is_active: ep.is_active,
      is_featured: ep.is_featured, is_background_audio: ep.is_background_audio,
      display_order: ep.display_order,
    });
    await fetchTracks(ep.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    await supabase.from('podcast_episodes').delete().eq('id', id);
    toast.success('تم الحذف'); fetchEpisodes();
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة البودكاست والراديو</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingId(null); setForm(emptyForm); setTracks([]); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />إضافة حلقة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل حلقة' : 'إضافة حلقة جديدة'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>العنوان (عربي)</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                <div><Label>العنوان (إنجليزي)</Label><Input value={form.title_en} onChange={e => setForm({...form, title_en: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>الوصف (عربي)</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <div><Label>الوصف (إنجليزي)</Label><Textarea value={form.description_en} onChange={e => setForm({...form, description_en: e.target.value})} /></div>
              </div>

              {/* Audio upload */}
              <div>
                <Label>الملف الصوتي الرئيسي</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={form.audio_url} onChange={e => setForm({...form, audio_url: e.target.value})} placeholder="رابط الصوت أو ارفع ملف" className="flex-1" />
                  <label className="cursor-pointer">
                    <input type="file" accept="audio/*" className="hidden" onChange={e => e.target.files?.[0] && uploadAudio(e.target.files[0])} />
                    <Button type="button" variant="outline" asChild disabled={uploading}>
                      <span>{uploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload className="w-4 h-4" />}</span>
                    </Button>
                  </label>
                </div>
                {form.audio_url && <audio src={form.audio_url} controls className="w-full mt-2 h-8" />}
              </div>

              {/* Playlist Tracks */}
              <PlaylistTracksManager
                episodeId={editingId || ''}
                tracks={tracks}
                onTracksChange={setTracks}
              />

              {/* Thumbnail */}
              <div>
                <Label>صورة الغلاف</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={form.thumbnail_url} onChange={e => setForm({...form, thumbnail_url: e.target.value})} placeholder="رابط الصورة أو ارفع" className="flex-1" />
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadThumbnail(e.target.files[0])} />
                    <Button type="button" variant="outline" asChild><span><Upload className="w-4 h-4" /></span></Button>
                  </label>
                </div>
                {form.thumbnail_url && <img src={form.thumbnail_url} alt="" className="w-16 h-16 rounded-lg mt-2 object-cover" />}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>النوع</Label>
                  <Select value={form.episode_type} onValueChange={v => setForm({...form, episode_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="podcast">بودكاست</SelectItem>
                      <SelectItem value="radio">راديو</SelectItem>
                      <SelectItem value="music">موسيقى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>المدة (ثواني)</Label><Input type="number" value={form.duration_seconds || ''} onChange={e => setForm({...form, duration_seconds: e.target.value ? +e.target.value : null})} /></div>
                <div><Label>ترتيب العرض</Label><Input type="number" value={form.display_order} onChange={e => setForm({...form, display_order: +e.target.value})} /></div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})} /><Label>مفعّل</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => setForm({...form, is_featured: v})} /><Label>مميز</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.is_background_audio} onCheckedChange={v => setForm({...form, is_background_audio: v})} /><Label>صوت خلفية</Label></div>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
              {editingId ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العنوان</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المقاطع</TableHead>
                <TableHead>خلفية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {episodes.map(ep => (
                <TableRow key={ep.id} className={!ep.is_active ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">{ep.title}</TableCell>
                  <TableCell><Badge variant="outline">{ep.episode_type}</Badge></TableCell>
                  <TableCell>
                    {trackCounts[ep.id] ? (
                      <Badge variant="secondary"><ListMusic className="w-3 h-3 mr-1" />{trackCounts[ep.id]}</Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{ep.is_background_audio ? '🔊 نعم' : '-'}</TableCell>
                  <TableCell>{ep.is_active ? <Badge>مفعّل</Badge> : <Badge variant="secondary">معطل</Badge>}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(ep)}><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(ep.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {episodes.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد حلقات</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PodcastManagement;
