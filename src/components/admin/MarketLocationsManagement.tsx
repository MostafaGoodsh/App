import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, Trash2, Plus, MapPin } from "lucide-react";

interface MarketLocation {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  location_type: string;
  latitude: number;
  longitude: number;
  address: string | null;
  phone: string | null;
  website: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

const MarketLocationsManagement = () => {
  const [locations, setLocations] = useState<MarketLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "", name_en: "", description: "", location_type: "store",
    latitude: "", longitude: "", address: "", phone: "", website: "",
  });

  useEffect(() => { fetchLocations(); }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("market_locations")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setLocations(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string, notes?: string) => {
    const { error } = await supabase
      .from("market_locations")
      .update({ status, admin_notes: notes || null, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error("حدث خطأ"); return; }
    toast.success(status === "approved" ? "تمت الموافقة" : "تم الرفض");
    fetchLocations();
  };

  const deleteLocation = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    const { error } = await supabase.from("market_locations").delete().eq("id", id);
    if (error) { toast.error("حدث خطأ"); return; }
    toast.success("تم الحذف");
    fetchLocations();
  };

  const addLocation = async () => {
    const lat = parseFloat(newLocation.latitude);
    const lng = parseFloat(newLocation.longitude);
    if (!newLocation.name || isNaN(lat) || isNaN(lng)) {
      toast.error("يرجى ملء الحقول المطلوبة"); return;
    }
    const { error } = await supabase.from("market_locations").insert({
      name: newLocation.name,
      name_en: newLocation.name_en || null,
      description: newLocation.description || null,
      location_type: newLocation.location_type,
      latitude: lat,
      longitude: lng,
      address: newLocation.address || null,
      phone: newLocation.phone || null,
      website: newLocation.website || null,
      status: "approved",
    });
    if (error) { toast.error("حدث خطأ: " + error.message); return; }
    toast.success("تمت الإضافة بنجاح");
    setShowAddDialog(false);
    setNewLocation({ name: "", name_en: "", description: "", location_type: "store", latitude: "", longitude: "", address: "", phone: "", website: "" });
    fetchLocations();
  };

  if (loading) return <div className="text-center py-8">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">المواقع ({locations.length})</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 ml-2" /> إضافة موقع</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة موقع متعاون جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>الاسم *</Label><Input value={newLocation.name} onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })} /></div>
                <div><Label>Name (EN)</Label><Input value={newLocation.name_en} onChange={(e) => setNewLocation({ ...newLocation, name_en: e.target.value })} /></div>
              </div>
              <div>
                <Label>نوع النشاط</Label>
                <Select value={newLocation.location_type} onValueChange={(v) => setNewLocation({ ...newLocation, location_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store">متجر</SelectItem>
                    <SelectItem value="market">سوق</SelectItem>
                    <SelectItem value="shop">محل</SelectItem>
                    <SelectItem value="restaurant">مطعم</SelectItem>
                    <SelectItem value="service">خدمات</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>الوصف</Label><Textarea value={newLocation.description} onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>خط العرض (Lat) *</Label><Input type="number" step="any" value={newLocation.latitude} onChange={(e) => setNewLocation({ ...newLocation, latitude: e.target.value })} placeholder="30.0444" /></div>
                <div><Label>خط الطول (Lng) *</Label><Input type="number" step="any" value={newLocation.longitude} onChange={(e) => setNewLocation({ ...newLocation, longitude: e.target.value })} placeholder="31.2357" /></div>
              </div>
              <div><Label>العنوان</Label><Input value={newLocation.address} onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>الهاتف</Label><Input value={newLocation.phone} onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })} /></div>
                <div><Label>الموقع</Label><Input value={newLocation.website} onChange={(e) => setNewLocation({ ...newLocation, website: e.target.value })} /></div>
              </div>
              <Button onClick={addLocation} className="w-full">إضافة (موافقة تلقائية)</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>النوع</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الإحداثيات</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead>إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((loc) => (
            <TableRow key={loc.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{loc.name}</div>
                  {loc.name_en && <div className="text-xs text-muted-foreground">{loc.name_en}</div>}
                </div>
              </TableCell>
              <TableCell>{loc.location_type}</TableCell>
              <TableCell>
                <Badge className={statusColors[loc.status] || ""}>{loc.status}</Badge>
              </TableCell>
              <TableCell className="text-xs">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</TableCell>
              <TableCell className="text-xs">{new Date(loc.created_at).toLocaleDateString("ar")}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {loc.status === "pending" && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(loc.id, "approved")}>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(loc.id, "rejected")}>
                        <XCircle className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  )}
                  {loc.status === "rejected" && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(loc.id, "approved")}>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deleteLocation(loc.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {locations.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                لا توجد مواقع بعد
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MarketLocationsManagement;
