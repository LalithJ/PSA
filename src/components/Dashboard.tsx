import React, { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Users,
  Search as SearchIcon,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Analytics, SearchHistory } from "../types";
import { getAnalytics, getSearchHistory } from "../services/database";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      try {
        const [aData, sData] = await Promise.all([
          getAnalytics(user.id),
          getSearchHistory(user.id, 5),
        ]);
        setAnalytics(aData);
        setRecentSearches(sData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (loading)
    return <div className="animate-pulse">Loading intelligence...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Morning, {user?.firstName?.split(" ")[0]}
        </h1>
        <p className="text-slate-500">
          Here is what happened with your lead generation since yesterday.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Contacts Revealed"
          value={analytics?.totalSearches || 0}
          icon={Users}
          trend="+12.5%"
        />
        <StatCard
          title="Search Success Rate"
          value="94.2%"
          icon={Target}
          trend="+2.1%"
        />
        <StatCard title="Active Campaigns" value="4" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Top Positions Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-900">Top Searched Positions</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-5">
            {analytics?.topSearchedPositions.map((item) => (
              <div key={item.position} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {item.position}
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.count} leads
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min((item.count / 20) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Searches Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {recentSearches.map((search) => (
              <div key={search.id} className="flex gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  <SearchIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {/* Use whatever search term property exists, e.g., 'query' or 'search_term' */}
                    {search.query || "Search Query"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {new Date(search.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
        <Icon className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
      </div>
      {trend && (
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          {trend}
        </span>
      )}
    </div>
    <p className="text-sm text-slate-500 font-medium">{title}</p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

export default Dashboard;
