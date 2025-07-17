import type { Metadata } from "next";
import "./globals.css";

const titles = [
  "lucian văleanu",
  "lucian",
];

function getRandomTitle(): string {
  return titles[Math.floor(Math.random() * titles.length)];
}

export const metadata: Metadata = {
  title: getRandomTitle(),
  description: "Developer, artist and plumber",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
