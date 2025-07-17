import type { Metadata } from "next";
import "./globals.css";

const titles = [
  "lucian văleanu",
  "nettle developer",
  "văleanu and sons plumbing", 
  "pierdevară",
  "lucian",
  "viața la țară"
];

function getRandomTitle(): string {
  return titles[Math.floor(Math.random() * titles.length)];
}

export const metadata: Metadata = {
  title: getRandomTitle(),
  description: "Developer, artist and plumber",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#FF5039" />
        <meta name="theme-color" content="#FF5039" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
