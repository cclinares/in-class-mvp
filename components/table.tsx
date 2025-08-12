export default function Table({ headers, rows }: { headers: string[], rows: (string|number|null|undefined)[][] }){
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {headers.map(h=> <th key={h} className="text-left p-2 border">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=> (
            <tr key={i} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-950">
              {r.map((c,ci)=> <td key={ci} className="p-2 border">{String(c ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}