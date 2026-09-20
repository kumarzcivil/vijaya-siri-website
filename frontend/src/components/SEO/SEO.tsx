import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  noIndex?: boolean;
}

const SITE_URL = "https://www.vijayasiri.com";

export default function SEO({
  title,
  description,
  canonical,
  noIndex = false,
}: SEOProps) {
  const canonicalUrl = `${SITE_URL}${canonical || "/"}`;

  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />

      <meta
        name="robots"
        content={noIndex ? "noindex,nofollow" : "index,follow"}
      />

      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Vijaya Siri" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
