import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LimBlog | Demo",
  description: "A lightweight blog platform demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-neutral-200 dark:selection:bg-neutral-800`}>
        <header className="py-8 px-5 lg:px-0">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              LimBlog
            </Link>
            <nav className="flex gap-4">
              <Link href="/" className="hover:underline text-sm text-neutral-600 dark:text-neutral-400">
                主页
              </Link>
              <Link href="/new" className="hover:underline text-sm text-neutral-600 dark:text-neutral-400">
                写博客
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-grow max-w-2xl w-full mx-auto px-5 lg:px-0">
          {children}
        </main>
        <footer className="py-10 text-center text-sm text-neutral-500 mt-20">
          <p>© {new Date().getFullYear()} LimBlog Demo. 由 Next.js 驱动。</p>
        </footer>
      </body>
    </html>
  );
}
