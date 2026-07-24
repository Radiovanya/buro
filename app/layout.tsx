import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Бюро строительства — управление снабжением",
  description: "Счета, заявки, доставки, платежи и бюджет строительных проектов в одном рабочем пространстве.",
  openGraph: {
    title: "Бюро строительства — управление снабжением",
    description: "Снабжение строительных проектов — под контролем.",
    images: [{ url: "/og.png", width: 1733, height: 909 }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
