import { Helmet } from "react-helmet-async";

export default function LocalBusinessSchema() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": "https://www.vijayasiri.com/#business",
    name: "Vijaya Siri",
    url: "https://www.vijayasiri.com",
    description:
      "Residential construction, renovation and home improvement services.",
    areaServed: [
      {
        "@type": "City",
        name: "Siruguppa",
      },
      {
        "@type": "City",
        name: "Adoni",
      },
      {
        "@type": "City",
        name: "Sindhanur",
      },
    ],
    knowsAbout: [
      "House Construction",
      "Home Renovation",
      "Modular Kitchen",
      "Flooring and Tiles",
      "Electrical Work",
      "Plumbing",
      "Painting",
      "Construction Cost Estimation",
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}