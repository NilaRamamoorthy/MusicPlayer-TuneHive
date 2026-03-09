import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Otp() {
  const navigate = useNavigate();
  const { email, setEmail, verifyOtp, sendOtp, loading, error } = useAuthStore();
  const [otp, setOtp] = useState("");

  const maskedEmail = useMemo(() => email || "(no email)", [email]);

  async function onVerify(e) {
    e.preventDefault();
    const ok = await verifyOtp(email, otp);
    if (ok) navigate("/");
  }

  async function onResend() {
    if (!email) return;
    await sendOtp(email);
  }

  return (
    <div className="min-h-screen bg-primary text-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-ink50 p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="font-itim text-3xl">Tune Hive</div>
          <div className="mt-3 text-subheading font-semibold">Verify OTP</div>
          <p className="mt-2 text-body opacity-90">
            Enter the 6-digit OTP sent to <span className="font-semibold">{maskedEmail}</span>
          </p>
        </div>

        {!email ? (
          <div className="space-y-4">
            <label className="block text-body">Email</label>
            <input
              className="w-full rounded-2xl px-4 py-3 text-black outline-none"
              type="email"
              placeholder="example@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        ) : null}

        <form onSubmit={onVerify} className="space-y-4 mt-4">
          <label className="block text-body">OTP</label>
          <input
            className="w-full rounded-2xl px-4 py-3 text-black outline-none tracking-widest text-center text-lg"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
          />

          {error ? <div className="text-sm text-white/90 bg-black/30 p-3 rounded-xl">{error}</div> : null}

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-secondary text-primary font-semibold py-3 hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Login"}
          </button>

          <button
            type="button"
            onClick={onResend}
            className="w-full rounded-2xl border border-white/50 py-3 hover:bg-white/10"
          >
            Resend OTP
          </button>
        </form>
      </div>
    </div>
  );
}