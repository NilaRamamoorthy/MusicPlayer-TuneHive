import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
      <div className="text-[20px] md:text-[24px] font-bold text-white mb-4">{title}</div>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const plan = useAuthStore((s) => s.plan);
  const logout = useAuthStore((s) => s.logout);

const handleLogout = () => {
  navigate("/logged-out");
};

  return (
    <div className="space-y-5">
      <div className="inline-block bg-white/15 px-2 py-1">
        <h1 className="text-[32px] md:text-[36px] font-bold text-white leading-none">
          Profile
        </h1>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-2 gap-5">
        <Card title="Profile">
          <div className="flex items-start gap-5">
            <div className="h-24 w-24 rounded-full border-4 border-white/60 flex items-center justify-center shrink-0">
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-white/70 text-sm">User Name</div>
                <div className="text-white text-2xl font-semibold">
                  {user?.email?.split("@")[0] || "User"}
                </div>
              </div>

              <div>
                <div className="text-white/70 text-sm">Email</div>
                <div className="text-white text-2xl font-semibold break-all">
                  {user?.email || "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button className="rounded-xl bg-white/70 px-5 py-3 text-sm font-semibold text-black">
              Edit profile
            </button>
            <button className="rounded-xl bg-white/70 px-5 py-3 text-sm font-semibold text-black">
              Change Password
            </button>
          </div>
        </Card>

        <Card title="Connected Devices & Integrations">
          <div className="space-y-4 text-white/90">
            {["iphone 15 Pro", "Macbook Pro", "Sonos Speaker"].map((device) => (
              <div key={device} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-white/70">◻</span>
                  <span>{device}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <span>Status</span>
                  <span className="h-2 w-2 rounded-full bg-cyan-300 inline-block" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button className="rounded-xl bg-white/70 px-5 py-3 text-sm font-semibold text-black">
              Manage Details
            </button>
            <button className="rounded-xl bg-white/70 px-5 py-3 text-sm font-semibold text-black">
              Connect New Device
            </button>
          </div>
        </Card>

        <Card title="Subscription">
          <div className="space-y-6 text-white/90">
            <div>
              <div className="text-white/70 text-sm">Plan</div>
              <div className="mt-1 text-lg font-semibold">{plan?.name || "Free"}</div>
            </div>

            <div>
              <div className="text-white/70 text-sm">Renewal</div>
              <div className="mt-1 text-lg font-semibold">
                {plan?.name && plan.name !== "Free" ? "Jan 31, 2026" : "—"}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/plans"
              className="rounded-xl bg-white/70 px-5 py-3 text-sm font-semibold text-black text-center"
            >
              Manage subscription
            </Link>
            <button className="rounded-xl bg-white/70 px-5 py-3 text-sm font-semibold text-black">
              View payment method
            </button>
          </div>
        </Card>

        <Card title="Settings">
          <div className="space-y-5">
            {[
              "Dark mode",
              "High Quality Audio",
              "Download over Wi-fi only",
            ].map((label) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <span className="text-white/90">{label}</span>
                <div className="h-7 w-14 rounded-full bg-white/40 relative">
                  <div className="absolute right-1 top-1 h-5 w-5 rounded-full bg-cyan-200" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="rounded-xl bg-white/70 px-5 py-3 text-sm font-semibold text-black min-w-[170px]"
            >
              Logout
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}