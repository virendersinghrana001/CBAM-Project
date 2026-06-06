import type { MetadataRoute } from "next";

const base = "https://ecoborder.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "", "/tools/emissions-calculator", "/tools/cbam-calculator", "/tools/cn-code-checker",
    "/cbam-readiness", "/tools/report-builder", "/about", "/privacy", "/terms",
  ];
  return routes.map((r) => ({
    url: `${base}${r}`,
    changeFrequency: "monthly" as const,
    priority: r === "" ? 1 : r.startsWith("/tools") || r === "/cbam-readiness" ? 0.9 : 0.5,
  }));
}
