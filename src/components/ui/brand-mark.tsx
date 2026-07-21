import Image from "next/image";
import Link from "next/link";

export function BrandMark({
  name = "REGENT MOTORS LLC",
  logoUrl = "/images/logo.png",
}: {
  name?: string;
  logoUrl?: string;
}) {
  return (
    <Link
      href="/"
      className="inline-flex items-center"
      aria-label={`${name} home`}
    >
      <Image
        src={logoUrl}
        alt=""
        width={856}
        height={722}
        priority
        unoptimized={logoUrl.startsWith("http")}
        className="h-14 w-auto object-contain"
      />
    </Link>
  );
}
