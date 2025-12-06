import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("hire-me@anshumat.org");
  const [password, setPassword] = useState("HireMe@2025!");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(email, password);
    if (!res.success) {
      setError(res.message);
    } else {
      if (res.user.role === "admin") navigate("/admin");
      else navigate("/employee");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded-lg p-6 mt-8">
      <h1 className="text-xl font-semibold mb-4 text-slate-800">Login</h1>
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-slate-800 text-white py-2 rounded-md text-sm"
        >
          Login
        </button>
      </form>
      <p className="mt-3 text-xs text-slate-600">
        New user?{" "}
        <Link to="/signup" className="text-slate-800 underline">
          Signup here
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
