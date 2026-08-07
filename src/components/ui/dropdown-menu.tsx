"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui-components/react/menu";
import { cn } from "@/lib/utils";

function DropdownMenu(props: React.ComponentProps<typeof MenuPrimitive.Root>) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger(props: React.ComponentProps<typeof MenuPrimitive.Trigger>) {
  return (
    <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" className={cn("cursor-pointer", props.className)} {...props} />
  );
}

function DropdownMenuPositioner(props: React.ComponentProps<typeof MenuPrimitive.Positioner>) {
  return <MenuPrimitive.Positioner data-slot="dropdown-menu-positioner" className="z-50 outline-none" {...props} />;
}

function DropdownMenuPortal(props: React.ComponentProps<typeof MenuPrimitive.Portal>) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuPopup({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Popup>) {
  return (
    <MenuPrimitive.Popup
      data-slot="dropdown-menu-popup"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 min-w-[10rem] overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Item>) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm",
        "flex items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPositioner,
  DropdownMenuPortal,
  DropdownMenuPopup,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
