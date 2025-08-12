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

  // OJO: usamos alias "curso:cursos(nombre)" para que el objeto anidado se llame "curso"
  const { data } = await supabase
    .from('asignaturas')
    .select('id,nombre, curso:cursos(nombre)')
    .eq('profesor_id', user.id)

  const asignaciones = (data ?? []) as Asignacion[]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Mis asignaturas</h1>
      <ul className="space-y-2">
        {asignaciones.map((a) => (
          <li key={a.id} className="p-3 rounded border">
            <b>{a.nombre}</b> — {a.curso?.nombre ?? 'Sin curso'}
          </li>
        ))}
      </ul>
    </div>
  )
}
