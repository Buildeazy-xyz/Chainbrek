import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "animate.css";
import { Loader2 } from "lucide-react";
import { authAPI, tokenManager } from "./apiService";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        setError("⚠️ All fields are required.");
        setLoading(false);
        return;
      }

      // Call backend login API
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      // Store token and user data
      tokenManager.setToken(response.token);
      localStorage.setItem("user", JSON.stringify({
        name: response.user.name,
        email: response.user.email,
        country: response.user.country,
        phoneNumber: response.user.phoneNumber
      }));

      alert("✅ Login successful! Welcome back!");
      navigate("/dashboard");

    } catch (error) {
      setError(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-600 to-red-800 p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 animate__animated animate__fadeInUp">
        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Chainbrek Logo"
            className="h-16 mx-auto animate__animated animate__bounceIn"
          />
          <h2 className="text-2xl font-bold text-gray-800 mt-4 animate__animated animate__fadeInDown">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm animate__animated animate__fadeIn">
            Login to your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm animate__animated animate__shakeX">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition transform hover:scale-105 animate__animated animate__pulse animate__infinite"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-red-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
