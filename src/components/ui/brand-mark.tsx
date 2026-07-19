import Image from "next/image";
import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="inline-flex items-center"
      aria-label="REGENT MOTORS LLC home"
    >
      <Image
        src="/images/logo.png"
        alt=""
        width={856}
        height={722}
        priority
        className="h-14 w-auto object-contain"
      />
    </Link>
  );
}
