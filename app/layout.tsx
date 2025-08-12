import './globals.css'
import { ReactNode } from 'react'

export const metadata = { title: 'IN‑Class', description: 'MVP escolar' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}