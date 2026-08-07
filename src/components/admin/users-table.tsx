"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Loader2, ShieldCheck, Store, User as UserIcon, Ban, UserCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { deleteUserAction, setUserStatusAction } from "@/server/application/user-actions";
import { EditUserForm } from "@/components/admin/edit-user-form";
import { formatDate } from "@/lib/utils";
import type { UserEntity, UserStatus } from "@/server/domain/user";

const STATUS_LABELS: Record<UserStatus, string> = {
  pending: "Pendiente",
  active: "Activo",
  disabled: "Deshabilitado",
};

const STATUS_VARIANT: Record<UserStatus, "outline" | "success" | "secondary"> = {
  pending: "outline",
  active: "success",
  disabled: "secondary",
};

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return (
      <Badge variant="default">
        <ShieldCheck className="size-3" /> Admin
      </Badge>
    );
  }
  if (role === "gestor") {
    return (
      <Badge variant="secondary">
        <Store className="size-3" /> Gestor
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      <UserIcon className="size-3" /> Cliente
    </Badge>
  );
}

function StatusToggle({ user }: { user: UserEntity }) {
  const [pending, startTransition] = useTransition();
  const isActive = user.status === "active";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await setUserStatusAction(new FormData(e.currentTarget));
        });
      }}
    >
      <input type="hidden" name="id" value={user.id} />
      <input type="hidden" name="status" value={isActive ? "disabled" : "active"} />
      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={pending || user.role === "admin"}
        title={user.role === "admin" ? "Las cuentas de administrador no se desactivan" : undefined}
      >
        {pending ? <Loader2 className="animate-spin" /> : isActive ? <Ban className="size-4" /> : <UserCheck className="size-4" />}
        {isActive ? "Desactivar" : "Activar"}
      </Button>
    </form>
  );
}

function EditDialog({ user, currentUserId }: { user: UserEntity; currentUserId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Editar a ${user.name ?? user.email}`} className="hover:bg-secondary" disabled={user.id === currentUserId}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>Actualiza los datos de acceso del usuario.</DialogDescription>
        </DialogHeader>
        <EditUserForm user={user} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function DeleteButton({ user, currentUserId }: { user: UserEntity; currentUserId?: string }) {
  const [pending, startTransition] = useTransition();
  const isSelf = user.id === currentUserId;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!confirm(`¿Eliminar al usuario "${user.name ?? user.email}"? Esta acción no se puede deshacer.`)) return;
        startTransition(async () => {
          await deleteUserAction(new FormData(e.currentTarget));
        });
      }}
    >
      <input type="hidden" name="id" value={user.id} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={pending || isSelf}
        aria-label={`Eliminar a ${user.name ?? user.email}`}
        title={isSelf ? "No puedes eliminar tu propia cuenta" : undefined}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {pending ? <Loader2 className="animate-spin" /> : <Trash2 className="size-4" />}
      </Button>
    </form>
  );
}

export function UsersTable({ users, currentUserId }: { users: UserEntity[]; currentUserId?: string }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Usuarios del sistema</h2>
          <p className="text-xs text-muted-foreground">
            {users.length} {users.length === 1 ? "usuario" : "usuarios"} registrados
          </p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Registrado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.name ?? "Sin nombre"}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                  {isSelf && <span className="ml-2 text-xs text-muted-foreground">(tú)</span>}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[user.status]}>{STATUS_LABELS[user.status]}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <StatusToggle user={user} />
                    <EditDialog user={user} currentUserId={currentUserId} />
                    <DeleteButton user={user} currentUserId={currentUserId} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
