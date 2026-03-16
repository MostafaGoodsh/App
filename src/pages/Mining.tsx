import { Helmet } from "react-helmet-async";
import MiningDashboard from "@/components/mining/MiningDashboard";
import { useLanguage } from "@/contexts/LanguageContext";

const Mining = () => {
  const { t } = useLanguage();
  return (
    <>
      <Helmet>
        <title>{t("التعدين")} - $MS-RA Mining</title>
        <meta name="description" content={t("لوحة التعدين")} />
      </Helmet>
      <MiningDashboard />
    </>
  );
};

export default Mining;
