'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data: signIn, error: err } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      })
      if (err) throw err
      const userId = signIn.user?.id
      if (!userId) throw new Error('No se pudo obtener el usuario')

      // buscar rol en perfiles
      const { data: perfil, error: perErr } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', userId)
        .maybeSingle()

      if (perErr) throw perErr

      const rol = perfil?.rol ?? 'profesor' // default si no tiene perfil
      if (rol === 'admin') router.replace('/admin')
      else if (rol === 'profesor') router.replace('/profesor')
      else if (rol === 'inspector') router.replace('/inspector')
      else if (rol === 'apoderado') router.replace('/apoderado')
      else router.replace('/profesor')
    } catch (e: any) {
      setError(e.message ?? 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-[360px] max-w-[92vw] bg-gray-900/40 border rounded-2xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Ingresar</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded border px-3 py-2 bg-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full rounded border px-3 py-2 bg-transparent"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 font-medium disabled:opacity-60"
          >
            {loading ? 'Ingresando…' : 'Entrar'}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
        <div className="mt-3 text-sm">
          <Link href="/" className="opacity-80 hover:opacity-100">Volver</Link>
        </div>
      </div>
    </div>
  )
}
