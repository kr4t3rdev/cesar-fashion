"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, KeyRound, Loader2, MoreVertical, Pencil, Trash2, UserCheck, ShieldCheck, Store, User as UserIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteUserAction, setUserStatusAction } from "@/lib/api/actions";
import { EditUserForm } from "@/components/admin/edit-user-form";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { formatDate } from "@/lib/utils";
import type { UserEntity, UserStatus } from "@/lib/domain/user";

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

function UserActions({ user, currentUserId }: { user: UserEntity; currentUserId?: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [pendingToggle, startToggle] = useTransition();
  const [pendingDelete, startDelete] = useTransition();
  const router = useRouter();

  const isSelf = user.id === currentUserId;
  const isActive = user.status === "active";
  const isAdmin = user.role === "admin";

  const toggle = () => {
    if (isAdmin) return;
    const fd = new FormData();
    fd.set("id", user.id);
    fd.set("status", isActive ? "disabled" : "active");
    startToggle(async () => {
      await setUserStatusAction(fd);
      router.refresh();
    });
  };

  const remove = () => {
    if (isSelf) return;
    if (!confirm(`¿Eliminar al usuario "${user.name ?? user.email}"? Esta acción no se puede deshacer.`)) return;
    const fd = new FormData();
    fd.set("id", user.id);
    startDelete(async () => {
      await deleteUserAction(fd);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label={`Acciones para ${user.name ?? user.email}`} className="hover:bg-secondary">
              <MoreVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuPortal>
          <DropdownMenuPositioner side="bottom" align="end" sideOffset={4}>
            <DropdownMenuPopup>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" /> Editar datos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPasswordOpen(true)}>
                <KeyRound className="size-4" /> Cambiar contraseña
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={toggle}
                disabled={isAdmin || pendingToggle}
                title={isAdmin ? "Las cuentas de administrador no se desactivan" : undefined}
              >
                {pendingToggle ? <Loader2 className="animate-spin" /> : isActive ? <Ban className="size-4" /> : <UserCheck className="size-4" />}
                {isActive ? "Desactivar" : "Activar"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={remove}
                disabled={isSelf || pendingDelete}
                title={isSelf ? "No puedes eliminar tu propia cuenta" : undefined}
                className="text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
              >
                {pendingDelete ? <Loader2 className="animate-spin" /> : <Trash2 className="size-4" />} Eliminar
              </DropdownMenuItem>
            </DropdownMenuPopup>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>Actualiza los datos del usuario.</DialogDescription>
          </DialogHeader>
          <EditUserForm user={user} onDone={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>Establece una nueva contraseña para {user.name ?? user.email}.</DialogDescription>
          </DialogHeader>
          <ChangePasswordForm user={user} onDone={() => setPasswordOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
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
                  <UserActions user={user} currentUserId={currentUserId} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
