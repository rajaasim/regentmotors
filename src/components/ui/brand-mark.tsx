import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="inline-flex flex-col leading-none tracking-[0.24em] text-white"
      aria-label="Regent Motors home"
    >
      <span className="text-sm font-bold">REGENT</span>
      <span className="mt-1 text-[0.48rem] font-semibold text-gold">MOTORS</span>
    </Link>
  );
}
