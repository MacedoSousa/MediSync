"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const path = usePathname();
  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} className={`px-3 py-2 rounded-md text-sm font-medium ${path === href ? "bg-teal-600 text-white" : "text-slate-700 hover:bg-teal-50"}`}>
      {label}
    </Link>
  );
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-slate-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
        <Link href="/" className="font-semibold text-slate-800">MediSync</Link>
        <nav className="flex items-center gap-2">
          <NavLink href="/" label="Início" />
          <NavLink href="/appointments" label="Consultas" />
          <NavLink href="/availability" label="Disponibilidade" />
          <NavLink href="/exams" label="Exames" />
          <NavLink href="/ai" label="IA" />
          <NavLink href="/login" label="Login" />
        </nav>
      </div>
    </header>
  );
}



