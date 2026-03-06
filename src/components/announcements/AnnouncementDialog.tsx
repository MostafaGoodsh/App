import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Announcement {
  id: string;
  title: string;
  message: string;
  is_urgent: boolean;
  created_at: string;
}

export default function AnnouncementDialog() {
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchActiveAnnouncement();
  }, [user]);

  const fetchActiveAnnouncement = async () => {
    try {
      // Get latest active announcement
      const { data: announcements, error } = await supabase
        .from('platform_announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !announcements || announcements.length === 0) return;

      const latestAnnouncement = announcements[0];

      // Check if user already dismissed it
      const { data: dismissal } = await supabase
        .from('announcement_dismissals')
        .select('id')
        .eq('user_id', user!.id)
        .eq('announcement_id', latestAnnouncement.id)
        .maybeSingle();

      if (!dismissal) {
        setAnnouncement(latestAnnouncement);
        setOpen(true);
      }
    } catch (error) {
      console.error('Error fetching announcement:', error);
    }
  };

  const handleDismiss = async () => {
    if (!announcement || !user) return;

    try {
      await supabase
        .from('announcement_dismissals')
        .insert({ user_id: user.id, announcement_id: announcement.id });
    } catch (error) {
      console.error('Error dismissing announcement:', error);
    }

    setOpen(false);
    setAnnouncement(null);
  };

  const handleConfirmAndNotify = async () => {
    if (!announcement || !user) return;

    try {
      // Dismiss the announcement
      await supabase
        .from('announcement_dismissals')
        .insert({ user_id: user.id, announcement_id: announcement.id });

      // Save as notification for the user
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: announcement.title,
          message: announcement.message,
          type: announcement.is_urgent ? 'warning' : 'system',
          is_read: false,
          is_admin_notification: false,
        });
    } catch (error) {
      console.error('Error confirming announcement:', error);
    }

    setOpen(false);
    setAnnouncement(null);
  };

  if (!announcement) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleDismiss(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-cairo">
            {announcement.is_urgent ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <Bell className="h-5 w-5 text-primary" />
            )}
            {announcement.title}
            {announcement.is_urgent && (
              <Badge variant="destructive" className="text-xs">عاجل</Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {new Date(announcement.created_at).toLocaleDateString('ar-EG', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 max-h-[50vh] overflow-y-auto">
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-cairo text-foreground">
            {announcement.message}
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button onClick={handleConfirmAndNotify} className="w-full sm:w-auto font-cairo">
            تأكيد وحفظ في الإشعارات
          </Button>
          <Button variant="outline" onClick={handleDismiss} className="w-full sm:w-auto font-cairo">
            تم القراءة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
