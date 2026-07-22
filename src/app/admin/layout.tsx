export default function AdminRouteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-shell min-h-screen">{children}</div>;
}
