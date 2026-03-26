import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "./components/LogoutButton";
import { ThemeProvider } from "./components/ThemeProvider";
import { Providers } from "./components/Providers";
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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Providers>
            <header className="py-6">
              <div className="max-w-3xl mx-auto px-5 flex items-center gap-5 flex-wrap">
                <Link href="/" className="text-base font-bold tracking-tight text-stone-900 dark:text-neutral-100">
                  {blogName}
                </Link>
                <nav className="flex gap-5 items-center">
                  <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline text-base">
                    Blog
                  </Link>
                  <Link href="/links" className="text-blue-600 dark:text-blue-400 hover:underline text-base">
                    Links
                  </Link>
                  {session && (
                    <>
                      <span className="w-px h-4 bg-neutral-300 dark:bg-neutral-700" />
                      <Link href="/new" className="text-sm text-stone-600 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors">
                        New
                      </Link>
                      <Link href="/settings" className="text-sm text-stone-600 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors">
                        Settings
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
            <footer className="py-10 text-center text-sm text-neutral-500 mt-auto px-5">
              <p>Powered by <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{repoName}</a></p>
            </footer>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
