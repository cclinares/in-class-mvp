import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest){
  const body = await req.json()
  const { email, nombre, rol } = body
  if(!email || !rol) return NextResponse.json({ error:'Faltan campos' },{ status:400 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const createRes = await fetch(`${url}/auth/v1/admin/users`,{
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ email, password: crypto.randomUUID().slice(0,12) })
  })
  const createJson = await createRes.json()
  if(!createRes.ok) return NextResponse.json({ error: createJson?.msg || 'No se pudo crear en Auth' },{ status: 400 })

  const { id } = createJson.user
  const insertRes = await fetch(`${url}/rest/v1/perfiles`,{
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'apikey': key, 'Authorization': `Bearer ${key}`, 'Prefer':'return=representation' },
    body: JSON.stringify({ id, email, nombre: nombre??null, rol })
  })
  if(!insertRes.ok) return NextResponse.json({ error: 'Creado en Auth pero falló perfil' },{ status: 400 })

  return NextResponse.json({ ok:true })
}