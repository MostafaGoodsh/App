import { Helmet } from "react-helmet-async";
import MiningDashboard from "@/components/mining/MiningDashboard";

const Mining = () => {
  return (
    <>
      <Helmet>
        <title>التعدين | Mining - Ms-Ra Mining</title>
        <meta name="description" content="لوحة تحكم التعدين - تتبع تقدمك في تعدين عملة Ms-Ra ومراقبة قوة حسابك | Mining dashboard - track your Ms-Ra mining progress and monitor account strength" />
        <meta name="keywords" content="تعدين, Ms-Ra, عملة رقمية, blockchain, mining dashboard" />
      </Helmet>
      <MiningDashboard />
    </>
  );
};

export default Mining;