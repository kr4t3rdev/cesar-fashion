import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/admin/user-form";
import { UsersTable } from "@/components/admin/users-table";
import { listUsersFromApi } from "@/lib/api/server-data";
import { getServerUser, isAdmin } from "@/lib/api/server-auth";

export const metadata: Metadata = {
  title: "Usuarios — Administración",
};

export default async function AdminUsersPage() {
  const user = await getServerUser();
  if (!user || !isAdmin(user)) redirect("/admin");

  const users = await listUsersFromApi();

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Nuevo usuario</CardTitle>
            <CardDescription>Crea una cuenta para gestores, administradores o clientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm />
          </CardContent>
        </Card>

        <UsersTable users={users} currentUserId={user.id} />
      </div>
    </div>
  );
}
