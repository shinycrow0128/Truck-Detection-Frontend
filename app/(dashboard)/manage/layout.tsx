import { RoleGuard } from "@/components/RoleGuard";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRoles={["admin"]}>{children}</RoleGuard>;
}
