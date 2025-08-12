import Link from 'next/link'
import { ReactNode } from 'react'

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-[240px_1fr]">
      <aside className="p-4 bg-white/70 dark:bg-gray-900/50 border-r">
        <h2 className="text-lg font-semibold mb-4">IN‑Class</h2>
        <nav className="space-y-2 text-sm">
          <Link href="/admin" className="block">Dashboard</Link>
          <Link href="/admin/usuarios" className="block">Usuarios</Link>
          <Link href="/admin/cursos" className="block">Cursos</Link>
          <Link href="/admin/asignaturas" className="block">Asignaturas</Link>
          <Link href="/admin/asignaciones" className="block">Asignaciones</Link>
        </nav>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  )
}
