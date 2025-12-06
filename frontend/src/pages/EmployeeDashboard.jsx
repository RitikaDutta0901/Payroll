// frontend/src/pages/EmployeeDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import SalarySlipTable from "../components/SalarySlipTable.jsx";
import ExpenseTable from "../components/ExpenseTable.jsx";
import ExpenseForm from "../components/ExpenseForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from "recharts";
import jsPDF from "jspdf";

function EmployeeDashboard() {
  const { user } = useAuth();
  const [slips, setSlips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [employeeId, setEmployeeId] = useState("");

  useEffect(() => {
    if (user && user.id) {
      setEmployeeId(user.id);
    } else {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id) setEmployeeId(parsed.id);
        }
      } catch (e) {
        console.error("Error reading user from localStorage:", e);
      }
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [slipsRes, expRes] = await Promise.all([
        api.get("/salary-slip"),
        api.get("/expense")
      ]);
      setSlips(slipsRes.data || []);
      setExpenses(expRes.data || []);
    } catch (error) {
      console.error("Employee dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense = async (data) => {
    try {
      await api.post("/expense", data);
      await loadData();
    } catch (error) {
      console.error("Add expense error:", error);
    }
  };

  const copyEmployeeId = () => {
    if (!employeeId) return;
    navigator.clipboard.writeText(employeeId);
    alert("Employee ID copied!");
  };

  // ---------- PDF for single slip ----------
  const handleDownloadSlipPdf = (slip) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Salary Slip", 20, 20);

    doc.setFontSize(12);
    doc.text(`Employee: ${user?.name || ""}`, 20, 35);
    if (user?.email) {
      doc.text(`Email: ${user.email}`, 20, 42);
    }
    doc.text(`Month: ${slip.month}`, 20, 52);

    let y = 70;
    const lineGap = 8;

    doc.text(`Basic:      ${slip.basic}`, 20, y);
    y += lineGap;
    doc.text(`Allowances: ${slip.allowances}`, 20, y);
    y += lineGap;
    doc.text(`Deductions: ${slip.deductions}`, 20, y);
    y += lineGap;
    doc.text(`Net Salary: ${slip.net}`, 20, y);

    doc.save(`salary-slip-${slip.month}.pdf`);
  };

  // ---------- CHART DATA ----------

  // Salary chart: month vs net
  const salaryChartData = useMemo(() => {
    if (!slips || slips.length === 0) return [];
    // assume month as "YYYY-MM"
    const sorted = [...slips].sort((a, b) =>
      a.month.localeCompare(b.month)
    );
    return sorted.map((s) => ({
      month: s.month,
      net: s.net
    }));
  }, [slips]);

  // Expense chart: total per month
  const expenseChartData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    const map = {};
    expenses.forEach((e) => {
      const d = new Date(e.date);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + e.amount;
    });
    return Object.keys(map)
      .sort()
      .map((month) => ({ month, total: map[month] }));
  }, [expenses]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">
        Employee Dashboard
      </h1>

      {/* Employee ID Box */}
      {employeeId && (
        <div className="bg-white shadow rounded p-4 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-slate-600 text-xs">Your Employee ID</p>
            <p className="font-mono text-slate-800 text-sm mt-1 break-all">
              {employeeId}
            </p>
          </div>
          <button
            onClick={copyEmployeeId}
            className="self-start sm:self-auto px-3 py-1 bg-slate-800 text-white text-xs rounded"
          >
            Copy ID
          </button>
        </div>
      )}

      {loading && (
        <div className="text-sm text-slate-500">Loading your data...</div>
      )}

      {/* Charts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded p-4 h-64">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">
            Net Salary by Month
          </h2>
          {salaryChartData.length === 0 ? (
            <div className="text-xs text-slate-500">
              No salary slips to show.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salaryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="net" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white shadow rounded p-4 h-64">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">
            Expenses by Month
          </h2>
          {expenseChartData.length === 0 ? (
            <div className="text-xs text-slate-500">
              No expenses to show.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Salary Slips */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">Salary Slips</h2>
        <SalarySlipTable
          slips={slips}
          onDownloadPdf={handleDownloadSlipPdf}
        />
      </section>

      {/* Expenses */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">
          Submit Expense
        </h2>
        <ExpenseForm onSubmit={handleAddExpense} />

        <h3 className="text-sm font-semibold text-slate-700">
          Expense History
        </h3>
        <ExpenseTable expenses={expenses} showStatus={true} />
      </section>
    </div>
  );
}

export default EmployeeDashboard;
