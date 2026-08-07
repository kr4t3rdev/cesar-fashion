"use client";

import * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "cesar-fashion-cart";

export type CartItemKind = "product" | "combo";

export interface CartItem {
  key: string;
  kind: CartItemKind;
  id: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  currency: string;
  quantity: number;
  maxQuantity: number;
}

export type CartAddInput = Omit<CartItem, "key" | "quantity">;

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  addItem: (item: CartAddInput, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.key === "string" &&
    (v.kind === "product" || v.kind === "combo") &&
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.unitPrice === "number" &&
    typeof v.currency === "string" &&
    typeof v.quantity === "number" &&
    typeof v.maxQuantity === "number"
  );
}

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

let items: CartItem[] = typeof window === "undefined" ? [] : load();
let listeners: Array<() => void> = [];

function emit() {
  listeners.forEach((listener) => listener());
}

function mutate(updater: (prev: CartItem[]) => CartItem[]) {
  items = updater(items);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // almacenamiento no disponible: el carrito sigue funcionando en memoria
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): CartItem[] {
  return items;
}

function getServerSnapshot(): CartItem[] {
  return [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((item: CartAddInput, quantity = 1) => {
    mutate((prev) => {
      const key = `${item.kind}:${item.id}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxQuantity) }
            : i
        );
      }
      return [...prev, { ...item, key, quantity: Math.min(quantity, item.maxQuantity) }];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    mutate((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    mutate((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;
        const clamped = Math.max(1, Math.min(quantity, i.maxQuantity));
        return { ...i, quantity: clamped };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    mutate(() => []);
  }, []);

  const [isOpen, setIsOpen] = React.useState(false);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((acc, i) => acc + i.quantity, 0);
    const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
    return {
      items,
      count,
      subtotal,
      isOpen,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      openCart,
      closeCart,
    };
  }, [items, isOpen, addItem, removeItem, setQuantity, clearCart, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
