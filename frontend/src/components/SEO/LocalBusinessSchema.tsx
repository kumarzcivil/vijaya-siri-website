import { Helmet } from "react-helmet-async";

export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": "https://www.vijayasiri.com/#business",

    name: "Vijaya Siri",
    url: "https://www.vijayasiri.com/",
    description:
      "Vijaya Siri provides construction, home improvement, renovation, plumbing, electrical, painting, and flooring services.",

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

    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:30",
        closes: "18:00",
      },
    ],

    knowsAbout: [
      "House Construction",
      "Home Renovation",
      "Modular Kitchen",
      "Flooring and Tiles",
      "Electrical Services",
      "Plumbing Services",
      "Painting Services",
      "Construction Cost Estimation",
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}