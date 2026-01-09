import { Helmet } from "react-helmet-async";
import MiningDashboard from "@/components/mining/MiningDashboard";

const Mining = () => {
  return (
    <>
      <Helmet>
        <title>التعدين - $MS-RA Mining</title>
        <meta name="description" content="لوحة تحكم التعدين - تتبع تقدمك في تعدين عملة $MS-RA ومراقبة قوة حسابك" />
        <meta name="keywords" content="تعدين, $MS-RA, عملة رقمية, blockchain, mining dashboard" />
      </Helmet>
      <MiningDashboard />
    </>
  );
};

export default Mining;