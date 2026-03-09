import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import paymentBg from "../assets/payment-bg.webp";
import { useAuthStore } from "../store/authStore";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const upgradePlan = useAuthStore((s) => s.upgradePlan);

  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const details = useMemo(() => {
    return (
      location.state?.details || {
        planName: "Pro",
        billingType: "Monthly",
        amountPaid: "₹49.00",
        nextPaymentDate: "Jan 31, 2026",
      }
    );
  }, [location.state]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!details?.planName) return;
      const ok = await upgradePlan(details.planName);
      if (!alive) return;

      if (ok) {
        setDone(true);
      } else {
        setError("Failed to update subscription.");
      }
    })();

    return () => {
      alive = false;
    };
  }, [details?.planName, upgradePlan]);

  return (
    <div className="rounded-lg border border-white/10 bg-black/25 backdrop-blur-sm overflow-hidden">
      <div
        className="min-h-[calc(100vh-180px)] bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url(${paymentBg})`,
        }}
      >
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <h1 className="text-[36px] font-bold text-white">
            {error ? "Payment Processed" : "Payment Successful!"}
          </h1>

          <p className="mt-6 text-white/90 text-[16px] max-w-2xl mx-auto leading-relaxed">
            {error
              ? "Your payment was completed, but we could not refresh your subscription automatically."
              : "Your payment has been successfully processed, you now have access to your selected plan features."}
          </p>

          <div className="mt-8 text-[24px] font-semibold text-white">Plan Details</div>

          <div className="mt-6 mx-auto max-w-lg grid grid-cols-2 gap-x-6 gap-y-3 text-left">
            <div className="rounded border border-white/30 bg-black/20 px-4 py-3 text-white/90 text-sm">
              Plan name
            </div>
            <div className="rounded border border-white/30 bg-black/20 px-4 py-3 text-white text-sm">
              {details.planName}
            </div>

            <div className="rounded border border-white/30 bg-black/20 px-4 py-3 text-white/90 text-sm">
              Billing type
            </div>
            <div className="rounded border border-white/30 bg-black/20 px-4 py-3 text-white text-sm">
              {details.billingType}
            </div>

            <div className="rounded border border-white/30 bg-black/20 px-4 py-3 text-white/90 text-sm">
              Amount paid
            </div>
            <div className="rounded border border-white/30 bg-black/20 px-4 py-3 text-white text-sm">
              {details.amountPaid}
            </div>

            <div className="rounded border border-white/30 bg-black/20 px-4 py-3 text-white/90 text-sm">
              Next payment date
            </div>
            <div className="rounded border border-white/30 bg-black/20 px-4 py-3 text-white text-sm">
              {details.nextPaymentDate}
            </div>
          </div>

          {!done && !error ? (
            <div className="mt-6 text-white/75">Updating your subscription...</div>
          ) : null}

          {error ? (
            <div className="mt-6 text-red-300">{error}</div>
          ) : null}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="min-w-[170px] rounded-md bg-primary px-6 py-3 text-white font-semibold hover:opacity-95 transition"
            >
              Go to Player
            </button>

            <button
              onClick={() => navigate("/plans")}
              className="min-w-[190px] rounded-md bg-white/80 px-6 py-3 text-black font-semibold hover:bg-white transition"
            >
              View Account Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}