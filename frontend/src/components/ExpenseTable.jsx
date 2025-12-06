function ExpenseTable({ expenses, showStatus = true, onApprove, onReject }) {
    if (!expenses || expenses.length === 0) {
      return <div className="text-sm text-slate-500">No expenses yet.</div>;
    }
  
    return (
      <div className="overflow-x-auto text-sm">
        <table className="min-w-full border bg-white rounded">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 border">Date</th>
              <th className="px-3 py-2 border">Amount</th>
              <th className="px-3 py-2 border">Description</th>
              {showStatus && <th className="px-3 py-2 border">Status</th>}
              {onApprove && <th className="px-3 py-2 border">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e._id} className="hover:bg-slate-50">
                <td className="px-3 py-2 border">
                  {new Date(e.date).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 border">{e.amount}</td>
                <td className="px-3 py-2 border">{e.description}</td>
                {showStatus && (
                  <td className="px-3 py-2 border capitalize">{e.status}</td>
                )}
                {onApprove && (
                  <td className="px-3 py-2 border space-x-2">
                    {e.status === "pending" ? (
                      <>
                        <button
                          onClick={() => onApprove(e._id)}
                          className="px-2 py-1 text-xs rounded bg-emerald-500 text-white"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(e._id)}
                          className="px-2 py-1 text-xs rounded bg-red-500 text-white"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Reviewed: {e.status}
                      </span>
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
  
  export default ExpenseTable;
  