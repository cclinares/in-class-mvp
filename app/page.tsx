import { getServerSupabase } from '@/lib/auth-helpers'
import Link from 'next/link'

export default async function Home() {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  let rol: string | null = null
  if (user) {
    const { data } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
    rol = data?.rol ?? null
  }

  return (
    <div className="grid place-items-center min-h-screen p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">IN‑Class (MVP)</h1>
        {!user && <Link className="underline" href="/login">Ingresar</Link>}
        {user && rol === 'admin' && <Link className="underline" href="/admin">Ir al Admin</Link>}
        {user && rol === 'profesor' && <Link className="underline" href="/profesor">Ir al Panel Profesor</Link>}
      </div>
    </div>
  )
}