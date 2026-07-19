// Source: client-supplied Lovable reference archived in reference-screenshots/.
export const siteSettings = {
  name: "REGENT MOTORS LLC",
  shortName: "Regent",
  phoneDisplay: "+1 (848) 222-1811",
  phoneHref: "tel:+18482221811",
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
