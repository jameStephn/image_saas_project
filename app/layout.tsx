import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const ibmPlex= IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: "--font-ibm-plex"
});

export const metadata: Metadata = {
  title: "Imagination",
  description: "Edit your image With Imaginationn and AI will Blow your mind",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      variables: {colorPrimary: "#624cf5"},
    }}>

    <html lang="en">
      <body
        className={cn("font-IBMPlex antialiased",ibmPlex.variable)}
        >
        {children}
      </body>
    </html>
        </ClerkProvider>
  );
}
