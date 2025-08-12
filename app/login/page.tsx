'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setError(error.message)
    const { data } = await supabase.from('perfiles').select('rol').eq('id', (await supabase.auth.getUser()).data.user?.id).single()
    const rol = data?.rol
    if (rol === 'admin') location.href = '/admin'
    else if (rol === 'profesor') location.href = '/profesor'
    else location.href = '/'
  }

  return (
    <div className="grid place-items-center min-h-screen p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold">Ingresar</h1>
        <input className="w-full p-2 rounded border dark:bg-gray-800" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full p-2 rounded border dark:bg-gray-800" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full p-2 rounded bg-blue-600 text-white disabled:opacity-50">{loading?'Entrando…':'Entrar'}</button>
        <Link className="text-sm opacity-70" href="/">Volver</Link>
      </form>
    </div>
  )
}