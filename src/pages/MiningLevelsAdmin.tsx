import MiningLevelsManagement from "@/components/admin/MiningLevelsManagement";

export default function MiningLevelsAdmin() {
  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="min-h-screen bg-background/90">
        <MiningLevelsManagement />
      </div>
    </div>
  );
}