import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "./components/LogoutButton";
import { ThemeProvider } from "./components/ThemeProvider";
import prisma from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

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
  const repoName = "LimBlog";
  const repoUrl = "https://github.com/ifndf/limblog";

  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <title>{blogName}</title>
        <meta name="description" content="A lightweight blog platform" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="py-10 px-5 lg:px-0">
            <div className="max-w-2xl mx-auto">
              <Link href="/" className="text-3xl font-bold tracking-tight block mb-4">
                {blogName}
              </Link>
              <nav className="flex gap-4 items-center flex-wrap">
                <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-base">
                  Home
                </Link>
                <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline text-base">
                  Blog
                </Link>
                <Link href="/friends" className="text-blue-600 dark:text-blue-400 hover:underline text-base">
                  Friends
                </Link>
                {session && (
                  <div className="flex gap-4 items-center border-l border-neutral-300 dark:border-neutral-700 ml-2 pl-4">
                    <Link href="/new" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 text-sm">
                      New
                    </Link>
                    <Link href="/settings" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 text-sm">
                      Settings
                    </Link>
                    <LogoutButton />
                  </div>
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
