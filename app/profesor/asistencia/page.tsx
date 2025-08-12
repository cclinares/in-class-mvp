'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type Curso = { id: number; nombre: string }
type Estudiante = { id: number; nombres: string; apellidos: string | null }
type Marca = { estado: 'P' | 'A' | 'J' | 'T'; obs: string }

export default function AsistenciaPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [cursos, setCursos] = useState<Curso[]>([])
  const [cursoId, setCursoId] = useState<number | ''>('')

  const [fecha, setFecha] = useState<string>(() => {
    const d = new Date()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
  })

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [marcas, setMarcas] = useState<Record<number, Marca>>({})

  // Sesión + cursos del profe (o todos si no tiene asignaciones)
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: asigs } = await supabase
        .from('asignaturas')
        .select('curso:cursos(id,nombre)')
        .eq('profesor_id', user.id)

      let cursosUnicos: Curso[] = []
      if (asigs && asigs.length) {
        const mapa = new Map<number, Curso>()
        for (const a of asigs as any[]) {
          const c = a.curso
          if (c && !mapa.has(c.id)) mapa.set(c.id, c)
        }
        cursosUnicos = Array.from(mapa.values())
      } else {
        const { data: allCursos } = await supabase
          .from('cursos')
          .select('id,nombre')
          .order('nombre', { ascending: true })
        cursosUnicos = (allCursos ?? []) as Curso[]
      }

      setCursos(cursosUnicos)
      setLoading(false)
    })()
  }, [])

  // Estudiantes del curso seleccionado + prefills del día
  useEffect(() => {
    if (!cursoId) return
    ;(async () => {
      const { data: ests } = await supabase
        .from('estudiantes')
        .select('id,nombres,apellidos')
        .eq('curso_id', cursoId)
        .order('nombres', { ascending: true })

      const lista = (ests ?? []) as Estudiante[]
      setEstudiantes(lista)

      if (lista.length > 0) {
        const ids = lista.map((e) => e.id)
        const { data: asis } = await supabase
          .from('asistencias')
          .select('estudiante_id,estado,observacion')
          .eq('fecha', fecha)
          .in('estudiante_id', ids)

        const inicial: Record<number, Marca> = {}
        for (const e of lista) inicial[e.id] = { estado: 'P', obs: '' }
        for (const a of (asis ?? []) as any[]) {
          inicial[a.estudiante_id] = { estado: a.estado, obs: a.observacion ?? '' }
        }
        setMarcas(inicial)
      } else {
        setMarcas({})
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoId, fecha])

  const cambiador = (id: number, campo: keyof Marca, val: string) => {
    setMarcas((m) => ({ ...m, [id]: { ...m[id], [campo]: val } as Marca }))
  }

  const guardar = async () => {
    if (!cursoId || !userId || !estudiantes.length) return
    const filas = estudiantes.map((e) => ({
      estudiante_id: e.id,
      fecha,
      estado: (marcas[e.id]?.estado ?? 'P') as 'P' | 'A' | 'J' | 'T',
      observacion: marcas[e.id]?.obs ?? null,
      profesor_id: userId,
    }))
    const { error } = await supabase
      .from('asistencias')
      .upsert(filas, { onConflict: 'estudiante_id,fecha' })
    if (error) alert(`Error al guardar: ${error.message}`)
    else alert('Asistencia guardada')
  }

  const exportarCSV = () => {
    if (!estudiantes.length) return
    const headers = ['Curso', 'Fecha', 'ID', 'Estudiante', 'Estado', 'Observación']
    const nombreCurso = cursos.find(c => c.id === cursoId)?.nombre ?? ''
    const rows = estudiantes.map((e) => {
      const m = marcas[e.id] ?? { estado: 'P', obs: '' }
      const nom = `${e.nombres}${e.apellidos ? ' ' + e.apellidos : ''}`
      return [nombreCurso, fecha, String(e.id), nom, m.estado, (m.obs || '').replace(/\n/g, ' ')]
    })
    const csv = [headers, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asistencia_${nombreCurso}_${fecha}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tituloCurso = useMemo(
    () => cursos.find(c => c.id === cursoId)?.nombre ?? '',
    [cursos, cursoId]
  )

  if (loading) return <div className="p-6">Cargando…</div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Asistencia</h1>
        <Link className="text-sm opacity-80 hover:opacity-100" href="/profesor">Volver</Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-sm block mb-1">Curso</label>
          <select
            className="w-full border rounded px-3 py-2 bg-transparent"
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Seleccione…</option>
            {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm block mb-1">Fecha</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2 bg-transparent"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <button onClick={guardar} className="rounded bg-blue-600 px-4 py-2 text-white">Guardar</button>
          <button onClick={exportarCSV} className="rounded border px-4 py-2">Exportar CSV</button>
        </div>
      </div>

      {cursoId && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-2 border text-left">Estudiante</th>
                <th className="p-2 border">P</th>
                <th className="p-2 border">A</th>
                <th className="p-2 border">J</th>
                <th className="p-2 border">T</th>
                <th className="p-2 border text-left">Observación</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((e) => {
                const nom = `${e.nombres}${e.apellidos ? ' ' + e.apellidos : ''}`
                const m = marcas[e.id] ?? { estado: 'P', obs: '' }
                return (
                  <tr key={e.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-950">
                    <td className="p-2 border">{nom}</td>
                    {(['P','A','J','T'] as const).map(val => (
                      <td key={val} className="p-2 border text-center">
                        <input
                          type="radio"
                          name={`m-${e.id}`}
                          checked={m.estado === val}
                          onChange={() => cambiador(e.id, 'estado', val)}
                        />
                      </td>
                    ))}
                    <td className="p-2 border">
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1 bg-transparent"
                        value={m.obs}
                        onChange={(ev) => cambiador(e.id, 'obs', ev.target.value)}
                        placeholder="Opcional"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!estudiantes.length && (
            <p className="text-sm opacity-75 p-3">
              No hay estudiantes en <b>{tituloCurso}</b>.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
