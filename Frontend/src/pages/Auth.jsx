import { useMemo, useState } from "react";
import heroImg from "../assets/login-hero.jpg";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, loading, error } = useAuthStore();

  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [agree, setAgree] = useState(false);

  const maskedEmail = useMemo(() => {
    if (!email) return "";
    const [u, d] = email.split("@");
    if (!d) return email;
    const safeUser = u.length <= 2 ? u : u.slice(0, 2) + "****";
    return `${safeUser}@${d}`;
  }, [email]);

  async function onContinue(e) {
    e.preventDefault();
    if (!agree) return; // mimic screenshot requirement
    const ok = await sendOtp(email);
    if (ok) setStep("otp");
  }

  async function onLogin(e) {
    e.preventDefault();
    const ok = await verifyOtp(email, otp);
    if (ok) navigate("/");
  }

  async function onResend() {
    if (!email) return;
    await sendOtp(email);
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Outer light frame like screenshot */}
      <div className="min-h-screen p-12 mx-5 mt-1">
        <div className="mx-auto max-w-6xl rounded-sm border border-black/10 bg-white p-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            {/* LEFT PANEL */}
            <div className="max-w-xl">
              {step === "email" ? (
                <>
                  <h1 className="text-[36px] font-bold text-black leading-tight">
                    Welcome to Tune Hive
                  </h1>
                  <p className="mt-1 text-[16px] text-black/70">
                    Login in or sign up with your email
                  </p>

                  <form onSubmit={onContinue} className="mt-3 space-y-5">
                    <input
                      className="w-full rounded-full border border-black/30 px-5 py-3 text-[16px] outline-none focus:border-black/50"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

              <button
  type="submit"
  className="w-full rounded-full bg-primary text-white py-3 font-semibold"
>
  Continue
</button>

{!agree && (
  <div className="text-[12px] text-primary">
    Please agree to Terms & Conditions to continue.
  </div>
)}

                    <p className="text-[12px] leading-relaxed text-black/60">
                      Select ‘Continue’ to give consent to Tune Hive Terms of Service and acknowledge that you have read and understood the Privacy Policy.
                      An email may be sent to authenticate your account.
                    </p>

                    <label className="flex items-center gap-2 text-[12px] text-black">
                      <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="font-semibold">
                        I agree to all the Terms and Conditions
                      </span>
                    </label>

                    {error ? (
                      <div className="text-[13px] text-red-600">{error}</div>
                    ) : null}

                    <div className="pt-2">
                      <div className="text-center text-[12px] text-black/50">
                        Or
                      </div>

                      <div className="mt-2 flex gap-6">
                        <button
                          type="button"
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2 text-[12px] text-black/70"
                        >
                          <span className="font-semibold">G</span>
                          Google
                        </button>

                        <button
                          type="button"
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2 text-[12px] text-black/70"
                        >
                          <span className="font-semibold">f</span>
                          Facebook
                        </button>
                      </div>

                      <div className="mt-6 text-center text-[12px] text-black/70">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setStep("otp")}
                          className="text-primary font-semibold"
                        >
                          login
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h1 className="text-[36px] font-bold text-black leading-tight">
                    Enter your 6-Digit Code
                  </h1>
                  <p className="mt-2 text-[12px] text-black/70">
                    We’ve send your code to the email.
                    <span className="ml-2 text-black/60">{maskedEmail}</span>
                    <button
                      type="button"
                      onClick={onResend}
                      className="ml-2 text-primary font-semibold"
                    >
                      Resend the code
                    </button>
                  </p>

                  <form onSubmit={onLogin} className="mt-7 space-y-5">
                    <input
                      className="w-full rounded-full border border-black/30 px-5 py-3 text-[18px] tracking-[0.35em] text-center outline-none focus:border-black/50"
                      inputMode="numeric"
                      placeholder="______"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      required
                    />

                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full rounded-full bg-primary py-3.5 text-white font-semibold tracking-wide disabled:opacity-50"
                    >
                      {loading ? "Logging in..." : "Log in"}
                    </button>

                    <p className="text-[12px] leading-relaxed text-black/60">
                      Select ‘Log In’ to give consent to Tune hive Terms of service and acknowledge that you have read and understood the privacy policy.
                    </p>

                    {error ? (
                      <div className="text-[13px] text-red-600">{error}</div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="text-[12px] text-black/60 underline"
                    >
                      Change email
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* RIGHT IMAGE PANEL (stays same) */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-xl">
                <img
                  src={heroImg}
                  alt="Tune Hive"
                  className="w-full  rounded-sm border border-black/10 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}