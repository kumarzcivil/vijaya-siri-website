import { useLocation } from "react-router-dom";
import SEO from "./SEO";

const routeSEO: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  "/": {
    title:
      "Vijaya Siri | Construction Services in Siruguppa, Adoni & Sindhanur",
    description:
      "Vijaya Siri provides house construction, home renovation, modular kitchens, flooring, electrical, plumbing and painting services in Siruguppa, Adoni and Sindhanur.",
  },

  "/about": {
    title: "About Vijaya Siri | Construction Services",
    description:
      "Learn about Vijaya Siri and our residential construction, renovation and home improvement services.",
  },

  "/projects": {
    title: "Construction Projects | Vijaya Siri",
    description:
      "Explore residential construction and home improvement projects by Vijaya Siri.",
  },

  "/pro-fix": {
    title: "Pro Fix Services | Vijaya Siri",
    description:
      "Professional home improvement services including modular kitchens, flooring, painting, plumbing and electrical work.",
  },

  "/quick-fix": {
    title: "Quick Fix Home Services | Vijaya Siri",
    description:
      "Book quick home repair and maintenance services in Siruguppa and nearby service areas.",
  },

  "/quote": {
    title: "Get a Construction Quote | Vijaya Siri",
    description:
      "Request a quote for house construction, renovation and home improvement services from Vijaya Siri.",
  },
};

export default function RouteSEO() {
  const { pathname } = useLocation();

  const seo = routeSEO[pathname];

  // Private, authentication and admin pages should not be indexed.
  const privateRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/control-center") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/payment") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/notifications");

  if (privateRoute) {
    return (
      <SEO
        title="Vijaya Siri"
        description="Vijaya Siri construction and home services."
        noIndex
      />
    );
  }

  if (!seo) {
    return (
      <SEO
        title="Vijaya Siri | Residential Construction Services"
        description="Residential construction and home improvement services by Vijaya Siri."
        noIndex={pathname === "/404"}
      />
    );
  }

  return (
    <SEO
      title={seo.title}
      description={seo.description}
      canonical={pathname}
    />
  );
}