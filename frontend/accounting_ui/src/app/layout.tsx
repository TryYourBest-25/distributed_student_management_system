import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Assuming Tailwind CSS is set up here
import NextAuthProvider from "@/components/auth/NextAuthProvider";
import AuthStatus from "@/components/auth/AuthStatus";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Accounting UI",
  description: "Student Tuition Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <NextAuthProvider>
          <header className="py-4 bg-gray-100">
            <nav className="container mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">Accounting UI</h1>
              <AuthStatus />
            </nav>
          </header>
          <main className="container mx-auto p-4">
            {children}
          </main>
          <footer className="py-4 text-center text-gray-500 bg-gray-100">
            <p>&copy; {new Date().getFullYear()} DSMS Project</p>
          </footer>
        </NextAuthProvider>
      </body>
    </html>
  );
}
