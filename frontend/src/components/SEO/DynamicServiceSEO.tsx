import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

const SITE_URL = "https://www.vijayasiri.com";

function formatServiceName(serviceId?: string) {
  if (!serviceId) return "Home Improvement Service";

  return decodeURIComponent(serviceId)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function DynamicServiceSEO() {
  const { serviceId } = useParams();
  const serviceName = formatServiceName(serviceId);

  const isQuickFix = window.location.pathname.startsWith("/quick-fix");

  const category = isQuickFix ? "Quick Fix" : "Pro Fix";

  const title = `${serviceName} in Siruguppa, Adoni & Sindhanur | Vijaya Siri`;

  const description = `Explore ${serviceName} through Vijaya Siri ${category} services in Siruguppa, Adoni, and Sindhanur. Contact us for reliable home improvement and construction solutions.`;

  const canonicalUrl = `${SITE_URL}${window.location.pathname}`;

  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Vijaya Siri" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}