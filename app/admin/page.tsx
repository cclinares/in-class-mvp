import Shell from '@/components/Shell'
import { getServerSupabase } from '@/lib/auth-helpers'

export default async function AdminHome() {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <p>Sin sesión</p>
  const { data: perfil } = await supabase.from('perfiles').select('rol,nombre').eq('id', user.id).single()
  if (perfil?.rol !== 'admin') return <p>Acceso restringido</p>
  return (
    <Shell>
      <h1 className="text-2xl font-semibold">Panel de Administración</h1>
      <p className="opacity-70">Bienvenido/a {perfil?.nombre ?? ''}</p>
    </Shell>
  )
}