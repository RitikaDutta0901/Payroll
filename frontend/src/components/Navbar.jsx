import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const copyEmployeeId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    alert("Employee ID copied!");
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="font-semibold text-lg text-slate-800">
          Payroll Management
        </div>

        <div className="flex-1 flex justify-end items-center gap-3 text-xs md:text-sm">
          {!user && (
            <>
              <Link
                to="/login"
                className="px-3 py-1 rounded-md bg-slate-800 text-white"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1 rounded-md border border-slate-800 text-slate-800"
              >
                Signup
              </Link>
            </>
          )}

          {user && (
            <>
              {/* Employee ID badge for employees */}
              {user.role === "employee" && (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-slate-600">
                    Employee ID:
                  </span>
                  <span className="font-mono text-[11px] sm:text-xs bg-slate-100 px-2 py-1 rounded">
                    {user.id}
                  </span>
                  <button
                    onClick={copyEmployeeId}
                    className="px-2 py-1 rounded bg-slate-800 text-white text-[11px] sm:text-xs"
                  >
                    Copy ID
                  </button>
                </div>
              )}

              <span className="hidden sm:inline text-slate-600">
                {user.name} ({user.role})
              </span>

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="px-3 py-1 rounded-md bg-slate-800 text-white"
                >
                  Admin
                </Link>
              )}
              {user.role === "employee" && (
                <Link
                  to="/employee"
                  className="px-3 py-1 rounded-md bg-slate-800 text-white"
                >
                  Employee
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-md border border-red-500 text-red-500"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
