import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Store, Phone, Globe, ExternalLink, Plus, Navigation, Coins } from "lucide-react";
import { MarketLocationForm } from "./MarketLocationForm";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

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
  logo_url: string | null;
  accepts_msra: boolean;
}

const LocationTypeLabels: Record<string, string> = {
  store: "متجر",
  market: "سوق",
  shop: "محل",
  restaurant: "مطعم",
  service: "خدمات",
  other: "أخرى",
};

interface MarketMapProps {
  title?: string;
  titleEn?: string;
  intro?: string;
  introEn?: string;
}

const MarketMap = ({
  title = "خريطة المتعاونين",
  titleEn = "Partners Map",
  intro = "اضغط على إضافة موقع لتسجيل موقعك (يحتاج موافقة الإدارة)",
  introEn,
}: MarketMapProps) => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<MarketLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 26.8206, lng: 30.8025 });
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  // Try to center map on user's GPS once on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("market_locations_public" as any)
        .select("id, name, name_en, description, location_type, latitude, longitude, address, website, logo_url, accepts_msra");
      if (error) throw error;
      setLocations((data as any) || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const recenterOnMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAddLocation = () => {
    // Submit using current map center (where the crosshair points)
    setSelectedCoords({ lat: mapCenter.lat, lng: mapCenter.lng });
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedCoords(null);
    fetchLocations();
  };

  // Build Google Maps embed URL centered on mapCenter
  const getEmbedUrl = () => {
    const { lat, lng } = mapCenter;
    return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  };

  const openInGoogleMaps = (lat: number, lng: number, name: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <Card className="bg-black/60 backdrop-blur-sm border-white/20">
        <CardHeader dir="rtl" className="text-right">
          <CardTitle className="text-white flex flex-row-reverse items-center justify-end gap-2 text-right">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <span className="block">{title}</span>
              {titleEn && <span className="block text-sm font-normal text-white/70">{titleEn}</span>}
            </div>
          </CardTitle>
          {user && (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-white/60 text-xs text-right flex-1">
                {intro}
                {introEn && <span className="block text-white/50">{introEn}</span>}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={recenterOnMe} disabled={locating} className="gap-1">
                  <Navigation className="w-4 h-4" />
                  {locating ? "..." : "موقعي"}
                </Button>
                <Button size="sm" onClick={handleAddLocation} className="gap-1">
                  <Plus className="w-4 h-4" />
                  إضافة هنا
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0 overflow-hidden rounded-b-lg">
          {/* Google Maps Embed centered on mapCenter */}
          <div className="relative w-full" style={{ height: "350px" }}>
            <iframe
              key={`${mapCenter.lat}-${mapCenter.lng}`}
              src={getEmbedUrl()}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="خريطة المتعاونين"
            />
            {/* Center crosshair indicator (marks where the new location will be saved) */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
              <div className="relative flex flex-col items-center">
                <MapPin
                  className="w-10 h-10 text-primary drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                  fill="hsl(var(--primary))"
                  strokeWidth={1.5}
                />
                <div className="w-2 h-2 rounded-full bg-primary border-2 border-background -mt-1 shadow-lg" />
              </div>
            </div>
            {user && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <span className="text-[10px] bg-black/70 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                  📍 اضغط "موقعي" ثم "إضافة هنا" — يمكنك تعديل الإحداثيات في النموذج
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Locations List */}
      {!loading && locations.length > 0 && (
        <div className="space-y-2">
          {locations.map((loc) => (
            <Card key={loc.id} className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-primary/40 transition-colors">
              <CardContent className="p-3 sm:p-4" dir="rtl">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    {loc.logo_url ? (
                      <img src={loc.logo_url} alt={loc.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <Store className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-white text-sm truncate">{loc.name}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        {loc.accepts_msra && (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0 gap-0.5">
                            <Coins className="w-2.5 h-2.5" />
                            <span dir="ltr">$MS-RA</span>
                          </Badge>
                        )}
                        <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                          {LocationTypeLabels[loc.location_type] || loc.location_type}
                        </span>
                      </div>
                    </div>
                    {loc.name_en && <p className="text-white/50 text-xs">{loc.name_en}</p>}
                    {loc.description && <p className="text-white/60 text-xs line-clamp-2">{loc.description}</p>}
                    {loc.address && <p className="text-white/50 text-xs">📍 {loc.address}</p>}
                    
                    {/* Actions Row */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        onClick={() => openInGoogleMaps(loc.latitude, loc.longitude, loc.name)}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        <Navigation className="w-3 h-3" />
                        فتح في الخريطة
                      </button>
                      {loc.phone && (
                        <a href={`tel:${loc.phone}`} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                          <Phone className="w-3 h-3" /> {loc.phone}
                        </a>
                      )}
                      {loc.website && (
                        <a href={loc.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                          <Globe className="w-3 h-3" /> الموقع
                        </a>
                      )}
                      <Link to={`/market/${loc.id}`} className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary/80">
                        <ExternalLink className="w-3 h-3" /> الصفحة
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && locations.length === 0 && (
        <p dir="rtl" className="text-white/40 text-center text-sm py-4">لا توجد مواقع معتمدة حالياً</p>
      )}

      {!user && (
        <p dir="rtl" className="text-white/50 text-right text-sm">سجّل دخولك لإضافة موقع متعاون جديد</p>
      )}

      {showForm && selectedCoords && (
        <MarketLocationForm
          latitude={selectedCoords.lat}
          longitude={selectedCoords.lng}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setSelectedCoords(null); }}
        />
      )}
    </div>
  );
};

export default MarketMap;
