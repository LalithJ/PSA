import React, { useState, useEffect } from "react";
import { getAnalytics } from "../services/database";
import { useAuth } from "../contexts/AuthContext";
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid"; // Swapped to Solid for "Elite" weight
import { Analytics } from "../types";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d",
  );

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const analyticsData = await getAnalytics(user.id, timeRange);
      setAnalytics(analyticsData);
      setLoading(false);
    };
    loadAnalytics();
  }, [timeRange, user?.id]);

  // Elite Red Palette (Red Hat inspired)
  const COLORS = ["#DC2626", "#991B1B", "#450A0A", "#EF4444", "#7F1D1D"];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] antialiased pb-20">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Header - High Density */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b-2 border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                System Intelligence
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900">
              Analytics Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="appearance-none bg-white pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest focus:border-red-600 outline-none transition-all cursor-pointer"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="1y">1 Year</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <button className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest border-b-4 border-red-800 hover:bg-red-500 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-2">
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export .CSV
            </button>
          </div>
        </div>

        {/* Key Metrics - Tactile Tiling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Total Searches",
              val: analytics.searchesInRange,
              icon: MagnifyingGlassIcon,
              color: "text-red-600",
              trend: "+12.5%",
            },
            {
              label: "Total Exports",
              val: analytics.totalExports,
              icon: DocumentArrowDownIcon,
              color: "text-gray-900",
              trend: "+8.3%",
            },
            {
              label: "Activity Vol",
              val: analytics.searchesInRange,
              icon: ChartBarIcon,
              color: "text-red-600",
              trend: "+15.2%",
            },
            {
              label: "Success Rate",
              val: "94.2%",
              icon: StarIcon,
              color: "text-orange-500",
              trend: "+2.1%",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white border-2 border-gray-100 p-6 rounded-3xl shadow-sm hover:border-red-100 transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                  {stat.trend}
                </span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-black tracking-tighter font-mono">
                {stat.val.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Row - Windows 1.0 Tiling logic */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-8 bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8">
              Search Velocity
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={analytics.searchesByDay}>
                <defs>
                  <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    fontWeight: "900",
                    fontSize: "12px",
                  }}
                  labelFormatter={(value) => formatDate(value)}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#DC2626"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRed)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-4 bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8">
              Lead Composition
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={analytics.topSearchedPositions}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {analytics.topSearchedPositions.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row - Performance + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <section className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
                Growth Intelligence
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <ArrowTrendingUpIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-gray-900">
                        Volume Growth
                      </p>
                      <p className="text-[11px] font-bold text-gray-400">
                        Monthly progression
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-black font-mono text-red-600">
                    +{analytics.growthRate.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <DocumentArrowDownIcon className="h-5 w-5 text-gray-900" />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-gray-900">
                        Export Efficiency
                      </p>
                      <p className="text-[11px] font-bold text-gray-400">
                        Conversion to CSV
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-black font-mono text-gray-900">
                    {analytics.exportRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </section>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-gray-50">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                Position Breakdown
              </h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Role
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Hits
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {analytics.topSearchedPositions.map((item) => (
                  <tr
                    key={item.position}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-8 py-4 text-[13px] font-black text-gray-900 group-hover:text-red-600 transition-colors">
                      {item.position}
                    </td>
                    <td className="px-8 py-4 text-[13px] font-mono font-bold text-gray-500">
                      {item.count}
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-[11px] font-black text-green-600">
                        +{Math.floor(Math.random() * 25 + 3)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
