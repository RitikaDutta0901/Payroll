function SalarySlipTable({ slips, onEdit, onDownloadPdf }) {
  if (!slips || slips.length === 0) {
    return <div className="text-sm text-slate-500">No salary slips yet.</div>;
  }

  const hasActions = !!onEdit || !!onDownloadPdf;

  return (
    <div className="overflow-x-auto text-sm">
      <table className="min-w-full border bg-white rounded">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 py-2 border">Month</th>
            <th className="px-3 py-2 border">Basic</th>
            <th className="px-3 py-2 border">Allowances</th>
            <th className="px-3 py-2 border">Deductions</th>
            <th className="px-3 py-2 border">Net</th>
            {hasActions && <th className="px-3 py-2 border">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {slips.map((s) => (
            <tr key={s._id} className="hover:bg-slate-50">
              <td className="px-3 py-2 border">{s.month}</td>
              <td className="px-3 py-2 border">{s.basic}</td>
              <td className="px-3 py-2 border">{s.allowances}</td>
              <td className="px-3 py-2 border">{s.deductions}</td>
              <td className="px-3 py-2 border font-semibold">{s.net}</td>
              {hasActions && (
                <td className="px-3 py-2 border space-x-2">
                  {onDownloadPdf && (
                    <button
                      onClick={() => onDownloadPdf(s)}
                      className="px-2 py-1 text-xs rounded border border-slate-700 text-slate-700"
                    >
                      PDF
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(s)}
                      className="px-2 py-1 text-xs rounded bg-slate-800 text-white"
                    >
                      Edit
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default SalarySlipTable;