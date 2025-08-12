import Link from 'next/link'
import { getServerSupabase } from '@/lib/auth-helpers'

type Asignacion = {
  id: number
  nombre: string
  curso?: { nombre?: string | null } | null
}

export default async function ProfesorHome() {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <p>Sin sesión</p>

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol,nombre')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'profesor') return <p>Acceso restringido</p>

  const { data } = await supabase
    .from('asignaturas')
    .select('id,nombre, curso:cursos(nombre)')
    .eq('profesor_id', user.id)

  const asignaciones = (data ?? []) as Asignacion[]

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Panel del Profesor</h1>
        <Link
          href="/profesor/asistencia"
          className="rounded bg-blue-600 px-3 py-1.5 text-white"
        >
          Ir a Asistencia
        </Link>
      </div>

      <h2 className="text-lg font-semibold">Mis asignaturas</h2>
      <ul className="space-y-2">
        {asignaciones.map((a) => (
          <li key={a.id} className="p-3 rounded border">
            <b>{a.nombre}</b> — {a.curso?.nombre ?? 'Sin curso'}
          </li>
        ))}
        {!asignaciones.length && (
          <li className="text-sm opacity-75">Aún no tienes asignaturas asignadas.</li>
        )}
      </ul>
    </div>
  )
}
