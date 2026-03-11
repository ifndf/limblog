import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "./components/LogoutButton";
import { ThemeProvider } from "./components/ThemeProvider";
import prisma from "@/lib/prisma";

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

  const configs = await prisma.siteConfig.findMany()
  const siteConfig: Record<string, string> = {}
  for (const c of configs) {
    siteConfig[c.key] = c.value
  }

  const blogName = siteConfig.blog_name || "LimBlog";
  const repoName = siteConfig.repo_name || "LimBlog";
  const repoUrl = siteConfig.repo_url || "https://github.com/yourname/limblog";

  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-neutral-200 dark:selection:bg-neutral-800`}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <header className="py-8 px-5 lg:px-0">
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link href="/" className="text-xl font-bold tracking-tight">
                {blogName}
              </Link>
              <nav className="flex gap-4 items-center flex-wrap">
                <Link href="/" className="hover:underline text-sm text-neutral-600 dark:text-neutral-400 relative top-px">
                  首页
                </Link>
                <Link href="/blog" className="hover:underline text-sm text-neutral-600 dark:text-neutral-400 relative top-px">
                  博客
                </Link>
                {session && (
                  <>
                    <Link href="/new" className="hover:underline text-sm text-neutral-600 dark:text-neutral-400">
                      写博客
                    </Link>
                    <Link href="/settings" className="hover:underline text-sm text-neutral-600 dark:text-neutral-400">
                      设置
                    </Link>
                    <LogoutButton />
                  </>
                )}
              </nav>
            </div>
          </header>
          <main className="flex-grow w-full">
            {children}
          </main>
          <footer className="py-10 text-center text-sm text-neutral-500 mt-20">
            <p>Powered by <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{repoName}</a></p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
