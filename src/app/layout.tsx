import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "./components/LogoutButton";
import { ThemeProvider } from "./components/ThemeProvider";
import ThemeToggle from "./components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LimBlog",
  description: "A lightweight blog platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-neutral-200 dark:selection:bg-neutral-800`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="py-8 px-5 lg:px-0">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <Link href="/" className="text-xl font-bold tracking-tight">
                LimBlog
              </Link>
              <nav className="flex gap-4 items-center">
                <ThemeToggle />
                <Link href="/" className="hover:underline text-sm text-neutral-600 dark:text-neutral-400">
                  主页
                </Link>
                {session ? (
                  <>
                    <Link href="/new" className="hover:underline text-sm text-neutral-600 dark:text-neutral-400">
                      写博客
                    </Link>
                    <Link href="/settings" className="hover:underline text-sm text-neutral-600 dark:text-neutral-400">
                      设置
                    </Link>
                    <LogoutButton />
                  </>
                ) : (
                  <Link href="/login" className="hover:underline text-sm text-neutral-600 dark:text-neutral-400">
                    后台登录
                  </Link>
                )}
              </nav>
            </div>
          </header>
          <main className="flex-grow max-w-2xl w-full mx-auto px-5 lg:px-0">
            {children}
          </main>
          <footer className="py-10 text-center text-sm text-neutral-500 mt-20">
            <p>© {new Date().getFullYear()} LimBlog. 由 Next.js 驱动。</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
