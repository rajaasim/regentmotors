export default function AdminRouteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-shell min-h-screen pt-28 sm:pt-32">{children}</div>;
}
