export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg-subtle)] p-4">
      {children}
    </div>
  );
}
