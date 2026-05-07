import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ClipboardList } from "lucide-react";

const STORAGE_KEY = "welcome_dialog_seen_v1";

export default function WelcomeDialog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const seenKey = `${STORAGE_KEY}_${user.id}`;
    if (localStorage.getItem(seenKey)) return;

    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", "welcome")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setOpen(true);
    })();
  }, [user?.id]);

  const dismiss = () => {
    if (user?.id) localStorage.setItem(`${STORAGE_KEY}_${user.id}`, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) dismiss(); }}>
      <DialogContent className="max-w-md text-center" dir="rtl">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">🎉 مرحباً بك في منصة مصر</DialogTitle>
          <DialogDescription className="text-base leading-relaxed pt-2">
            تم قبول طلبك بنجاح. الخطوة التالية: إكمال الاستبيان التعريفي ثم تقديم تحقق الهوية (KYC) للحصول على الوصول الكامل لكل الميزات بما فيها المحفظة.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button className="w-full" onClick={() => { dismiss(); navigate("/surveys"); }}>
            <ClipboardList className="h-4 w-4 ml-2" /> ابدأ الاستبيان الآن
          </Button>
          <Button variant="ghost" onClick={dismiss}>لاحقاً</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
