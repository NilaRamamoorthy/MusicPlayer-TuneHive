import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import paymentBg from "../assets/payment-bg.webp";

const fallbackPlans = {
  Free: {
    id: "Free",
    title: "Free",
    priceLabel: "₹0 / month",
  },
  Pro: {
    id: "Pro",
    title: "Pro",
    priceLabel: "₹49 / month",
  },
  Premium: {
    id: "Premium",
    title: "Premium",
    priceLabel: "₹99 / month",
  },
};

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { planId } = useParams();

  const selectedPlan = useMemo(() => {
    return location.state?.plan || fallbackPlans[planId] || null;
  }, [location.state, planId]);

  const [form, setForm] = useState({
    email: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    country: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleProceed = (e) => {
    e.preventDefault();

    navigate("/payment-success", {
      state: {
        details: {
          planName: selectedPlan?.title || "Plan",
          billingType: selectedPlan?.id === "Free" ? "Free" : "Monthly",
          amountPaid:
            selectedPlan?.id === "Free"
              ? "₹0.00"
              : selectedPlan?.id === "Pro"
              ? "₹49.00"
              : "₹99.00",
          nextPaymentDate:
            selectedPlan?.id === "Free" ? "—" : "Jan 31, 2026",
        },
      },
    });
  };

  return (
    <div className="rounded-lg border border-white/10 bg-black/25 backdrop-blur-sm overflow-hidden">
      <div
        className="min-h-[calc(100vh-180px)] bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url(${paymentBg})`,
        }}
      >
        <div className="mx-auto max-w-xl px-6 py-10">
          <form onSubmit={handleProceed} className="space-y-5">
            <button
              type="button"
              className="w-full rounded-md bg-primary py-3 text-white font-semibold text-[18px]"
            >
              Pay with UPI
            </button>

            <div className="text-center text-white/80 text-sm">or</div>

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full rounded bg-white/70 px-4 py-3 text-black outline-none"
              required
            />

            <div className="pt-2">
              <div className="text-[36px] font-bold text-white">Payment Method</div>
              <div className="mt-4 text-[24px] font-semibold text-white">Card Information</div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="123 123 1234 1234"
                value={form.cardNumber}
                onChange={(e) => handleChange("cardNumber", e.target.value)}
                className="w-full rounded bg-white/70 px-4 py-3 text-black outline-none pr-16"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-700 font-bold">
                VISA
              </span>
            </div>

            <div>
              <div className="mb-2 text-[24px] font-semibold text-white">Card Holdername</div>
              <input
                type="text"
                placeholder="Full name on card"
                value={form.cardName}
                onChange={(e) => handleChange("cardName", e.target.value)}
                className="w-full rounded bg-white/70 px-4 py-3 text-black outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="MM/YY"
                value={form.expiry}
                onChange={(e) => handleChange("expiry", e.target.value)}
                className="w-full rounded bg-white/70 px-4 py-3 text-black outline-none"
                required
              />
              <input
                type="text"
                placeholder="CVV"
                value={form.cvv}
                onChange={(e) => handleChange("cvv", e.target.value)}
                className="w-full rounded bg-white/70 px-4 py-3 text-black outline-none"
                required
              />
            </div>

            <div>
              <div className="mb-2 text-[24px] font-semibold text-white">Country/Region</div>
              <input
                type="text"
                placeholder="Country"
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full rounded bg-white/70 px-4 py-3 text-black outline-none"
                required
              />
            </div>

            <div className="rounded bg-white/10 border border-white/10 p-4 text-white/90">
              <div className="text-sm">Selected Plan</div>
              <div className="mt-1 text-lg font-semibold">{selectedPlan?.title || "Plan"}</div>
              <div className="text-sm text-white/75">
                {selectedPlan?.price || selectedPlan?.priceLabel || ""}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-primary py-3 text-white font-semibold text-[18px]"
            >
              Complete Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}