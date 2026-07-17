// Source: client-supplied Lovable reference archived in reference-screenshots/.
export const siteSettings = {
  name: "Regent Motors",
  shortName: "Regent",
  phoneDisplay: "647-618-0770",
  phoneHref: "tel:+16476180770",
  email: "info@regentmotors.ca",
  addressLine1: "39c Chambers Brg Rd #25e",
  addressLine2: "Lakewood, NJ 08701, USA",
  hours: ["Mon–Sat · 9:00 – 19:00", "Sun · By Appointment"],
  description:
    "A meticulously inspected collection of premium pre-owned vehicles, driven by trust and backed by quality.",
} as const;

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/inventory", label: "Inventory" },
  { href: "/financing", label: "Financing" },
  { href: "/contact", label: "Contact" },
] as const;
