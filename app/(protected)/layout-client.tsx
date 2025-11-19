"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { AIChatWidget } from "@/components/ai-chat-widget";
import Image from "next/image";

// Opsional: Jika Anda menggunakan library icon seperti Lucide-react, import di sini.
// Jika tidak, SVG bawaan di bawah tetap bekerja.

interface ProtectedLayoutClientProps {
  children: React.ReactNode;
  userEmail: string | null;
  navItems: Array<{ href: string; label: string; icon: string }>;
}

export function ProtectedLayoutClient({ children, userEmail, navItems }: ProtectedLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="relative min-h-screen w-full bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Background Decorations (Subtle Gradients) */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>
      <div className="fixed -top-24 -left-24 -z-10 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl filter"></div>
      <div className="fixed top-1/2 -right-24 -z-10 h-96 w-96 rounded-full bg-sky-200/30 blur-3xl filter"></div>

      {/* Mobile Overlay */}
      <div className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setSidebarOpen(false)} />

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/60 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-15 w-15 items-center justify-center rounded-lg bg-gradient-to-br  text-white shadow-lg shadow-emerald-500/30">
                <Image src={"https://i.pinimg.com/736x/d0/51/0b/d0510b5cdaf19112b91febe4604d94f8.jpg"} width={50} height={50} alt="opal" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-800">
                Apotek<span className="text-emerald-600"> An Nisa</span>
              </span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-slate-200">
            <div className="mb-6 px-2">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Menu Utama</p>
            </div>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      isActive ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm"
                    }`}
                  >
                    {isActive && <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />}
                    <span className={`text-lg transition-colors ${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer / User Info */}
          <div className="border-t border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200/60">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{userEmail ? userEmail.charAt(0).toUpperCase() : "A"}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-700">{userEmail ?? "Admin"}</p>
                <p className="truncate text-xs text-slate-500">Administrator</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Wrapper */}
        <main className="flex flex-1 flex-col overflow-hidden relative">
          {/* Top Header */}
          <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between border-b border-slate-200/60 bg-white/70 px-6 backdrop-blur-md lg:px-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 lg:hidden">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Breadcrumb-like Title or Search could go here */}
              <h1 className="hidden text-lg font-semibold text-slate-800 md:block">Dashboard Overview</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Dashboard Quick Action */}
              <Link
                href="/dashboard"
                className="hidden items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-emerald-600 hover:ring-emerald-200 md:flex"
              >
                Dashboard
              </Link>

              <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

              <SignOutButton />
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 scrollbar-thin scrollbar-thumb-slate-200 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-6">{children}</div>
          </div>
        </main>
      </div>

      {/* AI Chat Widget - Positioned nicely */}
      <AIChatWidget />
    </div>
  );
}
