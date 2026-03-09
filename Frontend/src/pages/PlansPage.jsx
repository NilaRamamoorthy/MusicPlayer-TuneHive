import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function mapPlanToCard(plan) {
  const name = plan.name;

  if (name === "Free") {
    return {
      id: "Free",
      title: "Free",
      badge: "Default",
      oldPrice: "",
      price: "₹0 / month",
      footer: "Basic access for all users",
      features: [
        "Ad-supported Music",
        "Standard sound Quality",
        "No Downloads",
        "Basic streaming access",
      ],
    };
  }

  if (name === "Pro") {
    return {
      id: "Pro",
      title: "Pro",
      badge: "Popular",
      oldPrice: "₹99",
      price: "₹49 / month",
      footer: "Best balance of features and price",
      features: [
        "Ad-free Music",
        "High sound Quality",
        "50 Downloads / month",
        "Better listening experience",
      ],
    };
  }

  return {
    id: "Premium",
    title: "Premium",
    badge: "Best Value",
    oldPrice: "₹199",
    price: "₹99 / month",
    footer: "Unlock the full Tune Hive experience",
    features: [
      "Ad-free Music",
      "Lossless sound Quality",
      "Unlimited Downloads",
      "Full premium access",
    ],
  };
}

function PlanCard({ plan, onSelect, isCurrent }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[rgba(21,48,77,0.72)] backdrop-blur-sm p-5 min-h-[250px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_35%)] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[20px] md:text-[22px] font-bold text-white">
            {plan.title}
          </div>

          <div className="flex items-center gap-2">
            {plan.badge ? (
              <span className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-black">
                {plan.badge}
              </span>
            ) : null}

            {isCurrent ? (
              <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-white">
                Current
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-[13px] text-white/90">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/70 text-[10px]">
                ✓
              </span>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={() => onSelect(plan)}
            disabled={isCurrent}
            className="flex w-full items-center justify-between rounded bg-white px-3 py-2 text-black font-semibold hover:opacity-95 transition disabled:opacity-60"
          >
            <span className="flex items-center gap-2 text-[14px]">
              {plan.oldPrice ? (
                <span className="text-black/40 line-through">{plan.oldPrice}</span>
              ) : null}
              <span>{plan.price}</span>
            </span>
            <span>{isCurrent ? "✓" : ">"}</span>
          </button>
        </div>

        <div className="mt-3 rounded bg-black/25 px-2 py-1 text-center text-[11px] text-white/85">
          {plan.footer}
        </div>
      </div>
    </div>
  );
}

function FooterLinksColumn({ title, items }) {
  return (
    <div>
      <div className="mb-2 text-[12px] font-semibold text-white/85">{title}</div>
      <div className="space-y-1 text-[11px] text-white/65">
        {items.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </div>
    </div>
  );
}

export default function PlansPage() {
  const navigate = useNavigate();
  const fetchPlans = useAuthStore((s) => s.fetchPlans);
  const backendPlans = useAuthStore((s) => s.plans);
  const currentPlan = useAuthStore((s) => s.plan);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const plans = backendPlans.map(mapPlanToCard);

  const handleSelectPlan = (plan) => {
    navigate(`/payment/${plan.id}`, { state: { plan } });
  };

  return (
    <div className="space-y-6">
      <section>
        <div className="inline-block bg-white/15 px-2 py-1">
          <h1 className="text-[32px] md:text-[36px] font-bold text-white leading-none">
            Available Plans
          </h1>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {loading && !plans.length ? (
            <div className="text-white/70">Loading plans...</div>
          ) : (
            plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={handleSelectPlan}
                isCurrent={currentPlan?.name === plan.id}
              />
            ))
          )}
        </div>
      </section>

      <section className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          <FooterLinksColumn title="Top Artists" items={["Neha kakkar", "Arijit Singh", "Badsha", "Justin", "Bieber"]} />
          <FooterLinksColumn title="Top Actors" items={["Rajini", "Vijay", "Surya", "Prabu", "Allu arjun"]} />
          <FooterLinksColumn title="Devotional Songs" items={["Krishna", "Deva Shree", "Ganesh", "Hanuman", "Gayatri"]} />
          <FooterLinksColumn title="Language" items={["Hindi songs", "Telugu songs", "Tamil songs", "Malayalam songs", "Odia songs"]} />
          <FooterLinksColumn title="Artist Original" items={["Zaedan", "Dooviyan", "Badsha", "Jsgas", "Sgjjr"]} />
          <FooterLinksColumn title="Company" items={["About us", "Culture", "Blogs", "Jobs", "Press", "Terms & Privacy"]} />
        </div>

        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[11px] text-white/65">
          <div>© 2025 Tune Hive Media Limited All rights Reserved</div>

          <div className="flex items-center gap-3">
            <span className="text-white/80">FOLLOW US</span>
            <span className="text-red-500">▶</span>
            <span className="text-white">◎</span>
            <span className="text-blue-400">in</span>
            <span className="text-blue-500">f</span>
            <span className="text-white">𝕏</span>
          </div>
        </div>
      </section>
    </div>
  );
}