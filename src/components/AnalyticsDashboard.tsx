import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../services/database';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChartBarIcon, 
  MagnifyingGlassIcon, 
  DocumentArrowDownIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Analytics } from '../types';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth(); 
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    const loadAnalytics = async () => {
          if (!user?.id) {  // ← CHECKS IF USER EXISTS
        setLoading(false);
        return;
      }
      setLoading(true);
      
      // Simulate API call
  const analyticsData = await getAnalytics(user.id,timeRange);
   setAnalytics(analyticsData);
      
     
      setLoading(false);
    };
    
    loadAnalytics();
  }, [timeRange]);

  const COLORS = ['#0077B5', '#00A0DC', '#0084BF', '#006699', '#004D73', '#00334D', '#001A26'];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linkedin-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-linkedin-blue"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-linkedin-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Track your people search performance and insights</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <button className="bg-linkedin-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-linkedin-darkBlue flex items-center">
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-linkedin p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MagnifyingGlassIcon className="h-8 w-8 text-linkedin-blue" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Searches</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.searchesInRange.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5% from last month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-linkedin p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentArrowDownIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Exports</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalExports}</p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.3% from last month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-linkedin p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
               <p className="text-sm font-medium text-gray-500">
    {timeRange === '7d' ? 'Last 7 Days' : 
     timeRange === '30d' ? 'Last 30 Days' :
     timeRange === '90d' ? 'Last 90 Days' : 
     'Last Year'}
  </p>
  <p className="text-2xl font-semibold text-gray-900">{analytics.searchesInRange}</p>
           
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15.2% from last month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-linkedin p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900">94.2%</p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+2.1% from last month</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Search Activity Chart */}
          <div className="bg-white rounded-lg shadow-linkedin p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Activity Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.searchesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value) => [value, 'Searches']}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0077B5" 
                  fill="#0077B5" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
   
        {/* Bottom Row */}
       
          {/* Top Positions Chart */}
          <div className="bg-white rounded-lg shadow-linkedin p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Searched Positions</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.topSearchedPositions}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ position, percent }: any) => `${position} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.topSearchedPositions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
     </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Insights */}
          <div className="bg-white rounded-lg shadow-linkedin p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h2>
            <div className="space-y-4">
             {/* Growth Rate */}
<div className={`flex items-center justify-between p-4 ${analytics.growthRate >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg`}>
  <div className="flex items-center">
    {analytics.growthRate >= 0 ? 
      <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 mr-3" /> :
      <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 mr-3" />
    }
    <div>
      <p className={`font-medium ${analytics.growthRate >= 0 ? 'text-green-900' : 'text-red-900'}`}>
        Search Volume Growth
      </p>
      <p className={`text-sm ${analytics.growthRate >= 0 ? 'text-green-700' : 'text-red-700'}`}>
        {analytics.growthRate >= 0 ? 'Increased' : 'Decreased'} by {Math.abs(analytics.growthRate).toFixed(1)}%
      </p>
    </div>
  </div>
  <span className={`font-semibold ${analytics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
    {analytics.growthRate >= 0 ? '+' : ''}{analytics.growthRate.toFixed(1)}%
  </span>
</div>

{/* Export Rate */}
<div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
  <div className="flex items-center">
    <DocumentArrowDownIcon className="h-5 w-5 text-blue-500 mr-3" />
    <div>
      <p className="font-medium text-blue-900">Export Efficiency</p>
      <p className="text-sm text-blue-700">
        {analytics.exportRate.toFixed(1)}% of searches result in exports
      </p>
    </div>
  </div>
  <span className="text-blue-600 font-semibold">{analytics.exportRate.toFixed(1)}%</span>
</div>
            </div>
          </div>
       
          {/* Top Positions Table */}
          <div className="bg-white rounded-lg shadow-linkedin">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Positions Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Position</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Searches</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics.topSearchedPositions.map((item, index) => (
                    <tr key={item.position}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.position}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.count}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-green-600">+{Math.floor(Math.random() * 25 + 3)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div> 
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
