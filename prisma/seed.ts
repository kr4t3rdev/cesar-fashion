import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

interface SeedProduct {
  name: string;
  description: string;
  category: string;
  price: number;
  salePrice: number | null;
  isOnSale: boolean;
  saleLabel: string | null;
  stock: number;
  featured: boolean;
  imageUrl: string;
  isWholesale?: boolean;
  wholesaleUnitName?: string;
  wholesaleUnitQuantity?: number;
}

const PRODUCTS: SeedProduct[] = [
  {
    name: "Blazer Estructurado Milano",
    description: "Blazer de corte estructurado en lana fría, hombros definidos y cierre de botón único. Pieza clave para un look de oficina impecable.",
    category: "Chaquetas",
    price: 189.0,
    salePrice: 139.0,
    isOnSale: true,
    saleLabel: "Oferta de temporada",
    stock: 24,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80",
  },
  {
    name: "Camisa Oxford Blanco",
    description: "Camisa clásica en algodón oxford de tejido italiano. Cuello semisoft y costura de doble aguja para un acabado resistente.",
    category: "Camisetas",
    price: 59.0,
    salePrice: null,
    isOnSale: false,
    saleLabel: null,
    stock: 60,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
  },
  {
    name: "Vestido Midi Seda Bordeaux",
    description: "Vestido midi en seda natural con caída fluida, escote en pico y cintura drapeada. Perfecto para eventos de noche.",
    category: "Vestidos",
    price: 220.0,
    salePrice: 165.0,
    isOnSale: true,
    saleLabel: "Últimas unidades",
    stock: 12,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
  },
  {
    name: "Sneakers Urban Canvas",
    description: "Sneakers de lona premium con suela de goma vulcanizada. Silueta limpia que combina con todo.",
    category: "Zapatos",
    price: 89.0,
    salePrice: null,
    isOnSale: false,
    saleLabel: null,
    stock: 45,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  },
  {
    name: "Hoodie Heavyweight Gris",
    description: "Sudadera de algodón pesado 450gsm con capucha doble forrada y bolsillo canguro. Talle oversize.",
    category: "Sudaderas",
    price: 75.0,
    salePrice: 52.0,
    isOnSale: true,
    saleLabel: "Flash sale",
    stock: 30,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
  },
  {
    name: "Pantalón Chino Slim",
    description: "Chino en sarga de algodón con corte slim y cintura ajustada con stretch. Versátil de oficina a fin de semana.",
    category: "Pantalones",
    price: 69.0,
    salePrice: null,
    isOnSale: false,
    saleLabel: null,
    stock: 50,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
  },
  {
    name: "Trench Coat Camel",
    description: "Gabinete clásico en gabardina color camel con forro a cuadros, cinturón y botones de madera. Atemporal.",
    category: "Abrigos",
    price: 259.0,
    salePrice: 194.0,
    isOnSale: true,
    saleLabel: "Pieza de colección",
    stock: 8,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
  },
  {
    name: "Bolso Tote Piel Negra",
    description: "Tote de piel genuina con interior forrado, compartimento para laptop y asas reforzadas.",
    category: "Accesorios",
    price: 149.0,
    salePrice: null,
    isOnSale: false,
    saleLabel: null,
    stock: 18,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
  },
  {
    name: "Body Spray Mary Kay (Caja x12)",
    description: "Caja de 12 unidades de spray corporal. Venta al por mayor para reventa o regalo.",
    category: "Accesorios",
    price: 6.0,
    salePrice: null,
    isOnSale: false,
    saleLabel: null,
    stock: 120,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80",
    isWholesale: true,
    wholesaleUnitName: "Caja",
    wholesaleUnitQuantity: 12,
  },
];

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin1234";
  await prisma.user.upsert({
    where: { email: "admin@cesarfashion.com" },
    update: {},
    create: {
      email: "admin@cesarfashion.com",
      name: "Cesar Admin",
      role: "admin",
      password: hashPassword(adminPassword),
    },
  });

  const gestorPassword = process.env.GESTOR_PASSWORD ?? "gestor1234";
  await prisma.user.upsert({
    where: { email: "gestor@cesarfashion.com" },
    update: {},
    create: {
      email: "gestor@cesarfashion.com",
      name: "Gestor Tienda",
      role: "gestor",
      password: hashPassword(gestorPassword),
    },
  });

  await prisma.product.deleteMany();
  await prisma.combo.deleteMany();

  const created: { id: string; name: string }[] = [];
  for (const p of PRODUCTS) {
    const { isWholesale, wholesaleUnitName, wholesaleUnitQuantity, ...rest } = p;
    const product = await prisma.product.create({
      data: {
        ...rest,
        currency: "USD",
        isWholesale: isWholesale ?? false,
        wholesaleUnitName: wholesaleUnitName ?? null,
        wholesaleUnitQuantity: wholesaleUnitQuantity ?? 1,
      },
    });
    created.push({ id: product.id, name: product.name });
  }

  const camisa = created.find((p) => p.name.includes("Camisa Oxford"));
  const pantalon = created.find((p) => p.name.includes("Pantalón Chino"));
  if (camisa && pantalon) {
    await prisma.combo.create({
      data: {
        name: "Set Oficina Esencial",
        description: "Camisa Oxford blanca + pantalón chino slim. El dúo perfecto para un look de oficina impecable.",
        price: 115.0,
        salePrice: 99.0,
        currency: "USD",
        isOnSale: true,
        saleLabel: "Pack ahorro",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
        items: {
          create: [
            { productId: camisa.id, quantity: 1 },
            { productId: pantalon.id, quantity: 1 },
          ],
        },
      },
    });
  }

  console.log(`Seed completado: ${PRODUCTS.length} productos y 1 combo creados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
