import { useEffect } from "react";
import { Link } from "react-router-dom";
import paymentBg from "../assets/payment-bg.webp";
import { useAuthStore } from "../store/authStore";

export default function LoggedOutPage() {
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-6"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url(${paymentBg})`,
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-8 text-center">
        <h1 className="text-[32px] font-bold text-white">
          You have been logged out.
        </h1>

        <p className="mt-4 text-white/80 text-sm">
          Thank you for using Tune Hive Music player. See you soon.
        </p>

        <div className="mt-8 space-y-4">
          <Link
            to="/login"
            className="block w-full rounded-xl bg-white/80 px-5 py-3 text-sm font-semibold text-black"
          >
            Login again
          </Link>

          {/* <Link
            to="/"
            className="block w-full rounded-xl bg-white/80 px-5 py-3 text-sm font-semibold text-black"
          >
            Go to home page
          </Link> */}
        </div>
      </div>
    </div>
  );
}