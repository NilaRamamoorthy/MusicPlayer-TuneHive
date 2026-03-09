import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const { sendOtp, loading, error } = useAuthStore();
  const [email, setEmail] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await sendOtp(email);
    if (ok) navigate("/otp");
  }

  return (
    // <div className="min-h-screen bg-primary flex items-center justify-center px-6">
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
      {/* Card */}
      <div className="bg-white w-full max-w-md rounded-[40px] px-10 py-12 shadow-xl text-center">
        
        {/* Logo */}
        <h1 className="font-itim text-3xl text-black mb-6">
          Tune Hive
        </h1>

        {/* Heading */}
        <h2 className="text-[36px] font-bold text-black mb-3">
          Login
        </h2>

        {/* Subtext */}
        <p className="text-[16px] text-black/70 mb-10 leading-relaxed">
          Enter your email to receive a 6 digit OTP and login to your account.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          
          <div>
            <label className="block text-[16px] text-black mb-2">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[20px] border border-black/20 px-5 py-3 text-black outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-4 rounded-[20px] hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

        </form>

      </div>
    </div>
  );
}