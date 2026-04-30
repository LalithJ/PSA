import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  History,
  CreditCard,
  Settings,
  User,
  LogOut,
  Zap,
  Database,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/search", icon: Search, label: "People Search" },
    { to: "/history", icon: History, label: "Search History" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" }, // New Feature
    { to: "/plans", icon: CreditCard, label: "Subscription" },
    { to: "/profile", icon: User, label: "User Profile" }, // New Feature
  ];
  const remainingMonthlyCredits = user?.remainingMonthlyCredits ?? 0;
  const topup = user?.topupCredits ?? 0;
  const monthlyCreditLimit = user?.subscriptionPlan?.monthlyCreditLimit ?? 1;

  const remainingSearches = user?.remainingSearches ?? 0;
  const searchLimit = user?.subscriptionPlan?.searchLimit ?? 1;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Dissemify
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 space-y-4">
        {/* Usage Section */}
        <div className="bg-slate-900 rounded-2xl p-4 text-white">
          {/* Search Quota Display */}
          <div className="mb-4">
            <p className="text-[10px] text-slate-400 mb-1 font-medium uppercase tracking-wider">
              Search Limit
            </p>
            <div className="flex items-end justify-between mb-1.5">
              <span className="text-lg font-bold">{remainingSearches}</span>
              <span className="text-[10px] text-slate-400">
                / {searchLimit} left
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min((remainingSearches / searchLimit) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Credits Remaining Display */}
          <div>
            <p className="text-[10px] text-slate-400 mb-1 font-medium uppercase tracking-wider">
              Credits (Reveal/Export)
            </p>
            <div className="flex items-end justify-between mb-1.5">
              <span className="text-lg font-bold">
                {remainingMonthlyCredits + topup}
              </span>
              <span className="text-[10px] text-slate-400">
                / {monthlyCreditLimit}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min((remainingMonthlyCredits / monthlyCreditLimit) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* User Profile Mini */}
        <div className="flex items-center gap-3 px-2 py-2 border-t border-slate-100 pt-4">
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
            {user?.firstName?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.firstName || "User"}
            </p>
            <button
              onClick={logout}
              className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3 h-3" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
