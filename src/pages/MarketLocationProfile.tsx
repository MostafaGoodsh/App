import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Store, Phone, Globe, MapPin, ArrowRight, Plus, Trash2, Pencil, Loader2, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MarketLocation {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  bio: string | null;
  location_type: string;
  latitude: number;
  longitude: number;
  address: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  user_id: string | null;
  accepts_msra: boolean;
  cooperation_note: string | null;
}

interface MarketProduct {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  price: number | null;
  currency: string;
  image_url: string | null;
  display_order: number;
}

const LocationTypeLabels: Record<string, string> = {
  store: "متجر", market: "سوق", shop: "محل",
  restaurant: "مطعم", service: "خدمات", other: "أخرى",
};

const MarketLocationProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [location, setLocation] = useState<MarketLocation | null>(null);
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", name_en: "", description: "", price: "", image_url: "" });

  useEffect(() => {
    if (id) {
      fetchLocation();
      fetchProducts();
    }
  }, [id]);

  useEffect(() => {
    if (location && user) {
      setIsOwner(location.user_id === user.id);
    }
  }, [location, user]);

  const fetchLocation = async () => {
    const { data, error } = await supabase
      .from("market_locations")
      .select("id, name, name_en, description, bio, location_type, latitude, longitude, address, phone, website, logo_url, cover_image_url, user_id, accepts_msra, cooperation_note")
      .eq("id", id!)
      .eq("status", "approved")
      .single();
    if (!error && data) setLocation(data);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("market_products")
      .select("id, name, name_en, description, price, currency, image_url, display_order")
      .eq("location_id", id!)
      .eq("is_active", true)
      .order("display_order");
    if (data) setProducts(data);
  };

  const addProduct = async () => {
    if (!newProduct.name) { toast.error("يرجى إدخال اسم المنتج"); return; }
    const { error } = await supabase.from("market_products").insert({
      location_id: id!,
      name: newProduct.name,
      name_en: newProduct.name_en || null,
      description: newProduct.description || null,
      price: newProduct.price ? parseFloat(newProduct.price) : null,
      image_url: newProduct.image_url || null,
    });
    if (error) { toast.error("حدث خطأ"); return; }
    toast.success("تمت الإضافة");
    setShowAddProduct(false);
    setNewProduct({ name: "", name_en: "", description: "", price: "", image_url: "" });
    fetchProducts();
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("هل أنت متأكد؟")) return;
    await supabase.from("market_products").delete().eq("id", productId);
    toast.success("تم الحذف");
    fetchProducts();
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!location) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">الموقع غير موجود</h2>
      <Button asChild variant="outline"><Link to="/">العودة للرئيسية</Link></Button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{location.name} | سوق مصر</title>
        <meta name="description" content={location.description || location.name} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6" dir="rtl">
        {/* Header Card */}
        <Card className="bg-black/60 backdrop-blur-sm border-white/20 overflow-hidden">
          {location.cover_image_url && (
            <div className="h-48 w-full overflow-hidden">
              <img src={location.cover_image_url} alt="غلاف" className="w-full h-full object-cover" />
            </div>
          )}
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              {location.logo_url && (
                <img src={location.logo_url} alt={location.name} className="w-16 h-16 rounded-full border-2 border-primary object-cover" />
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{location.name}</h1>
                {location.name_en && <p className="text-white/60 text-sm">{location.name_en}</p>}
                <Badge className="mt-2 bg-primary/20 text-primary">
                  <Store className="w-3 h-3 ml-1" />
                  {LocationTypeLabels[location.location_type] || location.location_type}
                </Badge>
                {location.accepts_msra && (
                  <Badge className="mt-2 mr-2 bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <Coins className="w-3 h-3 ml-1" />
                    يقبل <span dir="ltr" className="font-bold">$MS-RA</span>
                  </Badge>
                )}

            {(location.bio || location.description) && (
              <p className="text-white/80 text-sm leading-relaxed">{location.bio || location.description}</p>
            )}

            <div className="flex flex-wrap gap-3 text-sm">
              {location.address && (
                <span className="flex items-center gap-1 text-white/60">
                  <MapPin className="w-4 h-4 text-primary" /> {location.address}
                </span>
              )}
              {location.phone && (
                <a href={`tel:${location.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                  <Phone className="w-4 h-4" /> {location.phone}
                </a>
              )}
              {location.website && (
                <a href={location.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  <Globe className="w-4 h-4" /> الموقع الإلكتروني
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">المنتجات والخدمات</h2>
            {isOwner && (
              <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 ml-1" /> إضافة</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>إضافة منتج / خدمة</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>الاسم *</Label><Input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} /></div>
                    <div><Label>Name (EN)</Label><Input value={newProduct.name_en} onChange={e => setNewProduct({ ...newProduct, name_en: e.target.value })} /></div>
                    <div><Label>الوصف</Label><Textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} rows={2} /></div>
                    <div><Label>السعر</Label><Input type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" /></div>
                    <div><Label>رابط الصورة</Label><Input value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} placeholder="https://..." /></div>
                    <Button onClick={addProduct} className="w-full">إضافة المنتج</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {products.length === 0 ? (
            <Card className="bg-black/40 border-white/10">
              <CardContent className="py-12 text-center text-white/50">
                لا توجد منتجات بعد
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map(product => (
                <Card key={product.id} className="bg-black/40 border-white/10 overflow-hidden">
                  {product.image_url && (
                    <div className="h-40 overflow-hidden">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white">{product.name}</h3>
                        {product.name_en && <p className="text-xs text-white/50">{product.name_en}</p>}
                      </div>
                      {isOwner && (
                        <Button size="icon" variant="ghost" onClick={() => deleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      )}
                    </div>
                    {product.description && <p className="text-sm text-white/70">{product.description}</p>}
                    {product.price != null && (
                      <p className="text-primary font-bold">{product.price} {product.currency}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MarketLocationProfile;
