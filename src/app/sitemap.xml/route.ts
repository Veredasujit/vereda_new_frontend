import { NextResponse } from "next/server";

 const domains = ["vereda.co.in"];

export async function GET(req: Request) {
  const domain = req.headers.get("host") || "www.vereda.co.in";

  // Normalize the domain (remove 'www.' for checking)
  let normalizedDomain = domain.replace(/^www\./, "");

// Ensure only whitelisted domains are allowed
  if (!domains.includes(normalizedDomain)) {
    normalizedDomain = "vereda.co.in"; // Default domain
  }

  // Use both `domain` and `domains` together (set final domain)
  const finalDomain = domains.includes(normalizedDomain) ? normalizedDomain : "vereda.co.in";
  const siteUrl = `https://www.${finalDomain}`;

  // **Static pages**
  const staticPages = [
    "about-us","contact","login","payment-page","privacy","refund-policy","register",
    "terms-and-conditions","verify-otp","view-courses",
  ];

  // // **Dynamic pages (Fetch from API)**
  // let dynamicPages: string[] = [];

  // try {
  //   const res = await fetch(`${siteUrl}/api/get-pages`, { cache: "no-store" });

  //   if (res.ok) {
  //     dynamicPages = await res.json();
  //   } else {
  //     console.error("Failed to fetch dynamic pages");
  //   }
  // } catch (error) {
  //   console.error("Error fetching dynamic pages:", error);
  // }

  // // Combine static & dynamic pages
  // const allPages = [...staticPages, ...dynamicPages];

  const allPages=staticPages;

  // **Generate XML Sitemap**
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages
    .map(
      (page) => `
    <url>
      <loc>${siteUrl}/${page}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>`
    )
    .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}