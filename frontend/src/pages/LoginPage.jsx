import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../lib/AuthContext";
import { toast } from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("All fields are required.");
      return;
    }
    const res = await login(email, password);
    if (res.success) {
      toast.success("Login successful");
      navigate("/dashboard");
    } else {
      toast.error(res.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <form className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-gray-200" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
  SAN PEDRO TRANSPORT COOPERATIVE
</h2>
        <label className="block mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <label className="block mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button className="btn bg-red-600 hover:bg-red-700 text-white border-none w-full" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
