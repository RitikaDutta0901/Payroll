import { useState } from "react";

function ExpenseForm({ onSubmit }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !description) return;
    onSubmit({
      amount: Number(amount),
      description
    });
    setAmount("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs mb-1">Amount</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1 text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="flex-[2]">
          <label className="block text-xs mb-1">Description</label>
          <input
            className="w-full border rounded px-2 py-1 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
      </div>
      <button
        type="submit"
        className="px-3 py-1 text-sm rounded bg-slate-800 text-white"
      >
        Add Expense
      </button>
    </form>
  );
}

export default ExpenseForm;
