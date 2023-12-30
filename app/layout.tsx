import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { EditHistoryProvider } from "@/context/edit-history";

const dm_sans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thumbnailr",
  description:
    "Elevate your YouTube presence with Thumbnailr, the innovative app powered by the groundbreaking AI of DALL-E 3 and DALL-E 2. Unleash your creativity and generate eye-catching, custom thumbnails with ease. Thumbnailr harnesses advanced AI to transform your ideas into visually stunning designs, ensuring your videos stand out in the crowded digital landscape. Experience effortless thumbnail creation and captivate your audience at first glance!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <EditHistoryProvider>
        <body className={dm_sans.className}>
          {children} <Analytics />
        </body>
      </EditHistoryProvider>
    </html>
  );
}
