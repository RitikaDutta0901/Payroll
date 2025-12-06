// frontend/src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import SalarySlipTable from "../components/SalarySlipTable.jsx";
import ExpenseTable from "../components/ExpenseTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import jsPDF from "jspdf";

function AdminDashboard() {
  const { user } = useAuth();
  const [slips, setSlips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    employeeId: "",
    month: "2025-01",
    basic: "",
    allowances: "",
    deductions: ""
  });

  const [editingSlip, setEditingSlip] = useState(null); // null = create mode
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // ---------- LOAD DATA ----------

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [slipsRes, expRes, empRes] = await Promise.all([
        api.get("/salary-slip"),
        api.get("/expense?status=pending"),
        api.get("/users/employees")
      ]);

      setSlips(slipsRes.data || []);
      setExpenses(expRes.data || []);
      setEmployees(empRes.data || []);
    } catch (error) {
      console.error("Admin dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ---------- FORM HANDLERS ----------

  const handleChange = (e) => {
    setFormError("");
    setFormSuccess("");
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Create or update salary slip
  const handleSubmitSlip = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const employeeId = form.employeeId.trim();
    const month = String(form.month).trim();
    const basic = String(form.basic).trim();
    const allowances = String(form.allowances).trim();
    const deductions = String(form.deductions).trim();

    if (!employeeId || !month || !basic) {
      setFormError("Employee ID, Month and Basic salary are required.");
      return;
    }

    if (!/^[0-9a-fA-F]{24}$/.test(employeeId)) {
      setFormError("Invalid Employee ID. It must be a valid MongoDB ObjectId.");
      return;
    }

    try {
      const payload = {
        employeeId,
        month,
        basic: Number(basic),
        allowances: Number(allowances || 0),
        deductions: Number(deductions || 0)
      };

      if (editingSlip) {
        // UPDATE
        await api.put(`/salary-slip/${editingSlip._id}`, payload);
        setFormSuccess("Salary slip updated successfully.");
      } else {
        // CREATE
        await api.post("/salary-slip", payload);
        setFormSuccess("Salary slip created successfully.");
      }

      // reset numeric fields & editing state
      setForm((prev) => ({
        ...prev,
        basic: "",
        allowances: "",
        deductions: ""
      }));
      setEditingSlip(null);

      await loadDashboardData();
    } catch (error) {
      console.error(
        "Create/update salary slip error:",
        error.response?.data || error
      );
      const msg =
        error.response?.data?.message ||
        "Failed to save salary slip. Please check data.";
      setFormError(msg);
    }
  };

  const startEditSlip = (slip) => {
    setEditingSlip(slip);
    setForm({
      employeeId:
        typeof slip.employee === "object" && slip.employee !== null
          ? slip.employee._id || slip.employee.id
          : slip.employee,
      month: slip.month,
      // convert numbers to strings so trim() is safe
      basic: String(slip.basic ?? ""),
      allowances: String(slip.allowances ?? ""),
      deductions: String(slip.deductions ?? "")
    });
    setFormError("");
    setFormSuccess("");
  };

  const cancelEditSlip = () => {
    setEditingSlip(null);
    setFormError("");
    setFormSuccess("");
    setForm((prev) => ({
      ...prev,
      employeeId: "",
      basic: "",
      allowances: "",
      deductions: ""
    }));
  };

  // ---------- EXPENSE APPROVAL (optimistic) ----------

  const handleApprove = async (id) => {
    setExpenses((prev) => prev.filter((exp) => exp._id !== id));
    try {
      await api.patch(`/expense/${id}/status`, { status: "approved" });
    } catch (error) {
      console.error("Approve expense error:", error.response?.data || error);
      await loadDashboardData();
    }
  };

  const handleReject = async (id) => {
    setExpenses((prev) => prev.filter((exp) => exp._id !== id));
    try {
      await api.patch(`/expense/${id}/status`, { status: "rejected" });
    } catch (error) {
      console.error("Reject expense error:", error.response?.data || error);
      await loadDashboardData();
    }
  };

  // ---------- PDF DOWNLOAD ----------

  const handleDownloadSlipPdf = (slip) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Salary Slip", 20, 20);

    doc.setFontSize(12);
    doc.text(`Employee: ${slip.employee?.name || ""}`, 20, 35);
    if (slip.employee?.email) {
      doc.text(`Email: ${slip.employee.email}`, 20, 42);
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

  const copyAdminId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    alert("Admin ID copied!");
  };

  // ---------- RENDER ----------

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">
        Admin Dashboard
      </h1>

      {/* Admin ID card */}
      {user && (
        <div className="bg-white shadow rounded p-4 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-slate-600 text-xs">Your Admin ID</p>
            <p className="font-mono text-slate-800 text-sm mt-1 break-all">
              {user.id}
            </p>
          </div>
          <button
            onClick={copyAdminId}
            className="self-start sm:self-auto px-3 py-1 bg-slate-800 text-white text-xs rounded"
          >
            Copy Admin ID
          </button>
        </div>
      )}

      {loading && (
        <div className="text-sm text-slate-500 mb-2">
          Loading dashboard data...
        </div>
      )}

      {/* CREATE / UPDATE SALARY SLIP */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">
          {editingSlip ? "Update Salary Slip" : "Create Salary Slip"}
        </h2>

        {editingSlip && (
          <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded">
            Editing slip for{" "}
            <span className="font-semibold">
              {editingSlip.employee?.name || "employee"}
            </span>{" "}
            ({editingSlip.month}).{" "}
            <button
              type="button"
              className="underline"
              onClick={cancelEditSlip}
            >
              Cancel edit
            </button>
          </div>
        )}

        <div className="text-xs text-slate-500 mb-1">
          You can paste an employee ID manually or copy it from the Employee
          Directory below.
        </div>

        <form
          onSubmit={handleSubmitSlip}
          className="bg-white rounded shadow p-4 space-y-3 text-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs mb-1">Employee ID</label>
              <input
                name="employeeId"
                className="w-full border rounded px-2 py-1"
                placeholder="Paste employee _id here"
                value={form.employeeId}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs mb-1">
                Month{" "}
                <span className="text-[10px] text-slate-500">(YYYY-MM)</span>
              </label>
              <input
                name="month"
                className="w-full border rounded px-2 py-1"
                value={form.month}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Basic</label>
              <input
                name="basic"
                type="number"
                className="w-full border rounded px-2 py-1"
                value={form.basic}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Allowances</label>
              <input
                name="allowances"
                type="number"
                className="w-full border rounded px-2 py-1"
                value={form.allowances}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Deductions</label>
              <input
                name="deductions"
                type="number"
                className="w-full border rounded px-2 py-1"
                value={form.deductions}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-3 py-1 rounded bg-slate-800 text-white text-sm"
          >
            {editingSlip ? "Update Slip" : "Create Slip"}
          </button>
        </form>

        {formError && (
          <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
            {formError}
          </div>
        )}

        {formSuccess && (
          <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded">
            {formSuccess}
          </div>
        )}
      </section>

      {/* ALL SALARY SLIPS */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">
          All Salary Slips
        </h2>
        <SalarySlipTable
          slips={slips}
          onEdit={startEditSlip}
          onDownloadPdf={handleDownloadSlipPdf}
        />
      </section>

      {/* PENDING EXPENSES */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">
          Pending Expenses
        </h2>
        <ExpenseTable
          expenses={expenses}
          showStatus={true}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </section>

      {/* EMPLOYEE DIRECTORY */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">
          Employee Directory
        </h2>

        <div className="bg-white shadow rounded p-4 text-sm">
          {employees.length === 0 ? (
            <p className="text-xs text-slate-500">No employees found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs sm:text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Employee ID</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id} className="border-b last:border-0">
                      <td className="py-2 pr-3">{emp.name}</td>
                      <td className="py-2 pr-3">{emp.email}</td>
                      <td className="py-2 pr-3 font-mono text-[11px] break-all">
                        {emp._id}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(emp._id);
                            alert("Employee ID copied!");
                          }}
                          className="px-2 py-1 bg-slate-800 text-white rounded text-[11px]"
                        >
                          Copy ID
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
