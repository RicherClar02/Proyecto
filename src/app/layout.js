// app/layout.js

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Login Tienda",
  description: "Página de inicio de sesión",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Aquí puedes agregar un encabezado, una barra de navegación, etc. */}
        {children}
        {/* Aquí puedes agregar un pie de página */}
      </body>
    </html>
  );
}