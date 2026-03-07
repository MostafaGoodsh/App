import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
// leaflet CSS loaded via CDN in index.html for reliability
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Store, Phone, Globe, ExternalLink, Plus, Crosshair } from "lucide-react";
import { MarketLocationForm } from "./MarketLocationForm";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

// Fix default Leaflet marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom marker icon using app logo
const appIcon = new L.Icon({
  iconUrl: "/lovable-uploads/73294275-1418-4174-b109-0f587abab976.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  className: "rounded-full shadow-lg border-2 border-primary",
});

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
}

const LocationTypeLabels: Record<string, string> = {
  store: "متجر",
  market: "سوق",
  shop: "محل",
  restaurant: "مطعم",
  service: "خدمات",
  other: "أخرى",
};

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterButton({ onAdd }: { onAdd: (lat: number, lng: number) => void }) {
  const map = useMap();
  const [center, setCenter] = useState(map.getCenter());

  useMapEvents({
    moveend() {
      setCenter(map.getCenter());
    },
  });

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2">
      <div className="w-6 h-6 pointer-events-none absolute -top-[calc(50vh-120px)]">
        <Crosshair className="w-6 h-6 text-primary drop-shadow-lg" />
      </div>
      <Button
        size="sm"
        onClick={() => onAdd(center.lat, center.lng)}
        className="shadow-lg gap-1"
      >
        <Plus className="w-4 h-4" />
        إضافة موقع هنا
      </Button>
    </div>
  );
}

interface MarketMapProps {
  title?: string;
  titleEn?: string;
  intro?: string;
  introEn?: string;
}

const MarketMap = ({
  title = "خريطة المتعاونين",
  titleEn = "Partners Map",
  intro = "اضغط على الخريطة لإضافة موقع جديد (يحتاج موافقة الإدارة)",
  introEn,
}: MarketMapProps) => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<MarketLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("market_locations")
        .select("id, name, name_en, description, location_type, latitude, longitude, address, phone, website, logo_url")
        .eq("status", "approved");

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (user) {
      setSelectedCoords({ lat, lng });
      setShowForm(true);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedCoords(null);
    fetchLocations();
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
            <p className="text-white/60 text-sm text-right">
              {intro}
              {introEn && <span className="block text-white/50">{introEn}</span>}
            </p>
          )}
        </CardHeader>
        <CardContent className="p-0 overflow-hidden rounded-b-lg">
          {!loading && (
            <MapContainer
              center={[26.8206, 30.8025]}
              zoom={6}
              style={{ height: "450px", width: "100%" }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {user && <ClickHandler onMapClick={handleMapClick} />}
              {locations.map((loc) => (
                <Marker key={loc.id} position={[loc.latitude, loc.longitude]} icon={appIcon}>
                  <Popup>
                    <div className="text-sm space-y-1 min-w-[180px]" dir="rtl">
                      <h3 className="font-bold text-base">{loc.name}</h3>
                      {loc.name_en && <p className="text-muted-foreground text-xs">{loc.name_en}</p>}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Store className="w-3 h-3" />
                        {LocationTypeLabels[loc.location_type] || loc.location_type}
                      </div>
                      {loc.description && <p className="text-xs">{loc.description}</p>}
                      {loc.address && <p className="text-xs">📍 {loc.address}</p>}
                      {loc.phone && (
                        <a href={`tel:${loc.phone}`} className="flex items-center gap-1 text-xs text-primary">
                          <Phone className="w-3 h-3" /> {loc.phone}
                        </a>
                      )}
                      {loc.website && (
                        <a href={loc.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary">
                          <Globe className="w-3 h-3" /> الموقع
                        </a>
                      )}
                      <Link to={`/market/${loc.id}`} className="flex items-center gap-1 text-xs text-primary font-semibold mt-1">
                        <ExternalLink className="w-3 h-3" /> عرض الصفحة
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </CardContent>
      </Card>

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
