import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cesar Fashion LLC — Moda Editorial",
    template: "%s | Cesar Fashion LLC",
  },
  description:
    "Tienda online de moda. Piezas seleccionadas de alta calidad para quienes visten con intención.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${display.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t;try{t=localStorage.getItem("theme")}catch(e){}if(t==="dark"||t==="light"){if(t==="dark")document.documentElement.classList.add("dark")}else if(window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.classList.add("dark")}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
