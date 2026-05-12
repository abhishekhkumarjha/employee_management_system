import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { mockDepartments, mockAttendance, mockPayroll } from '../lib/mockData';

const data = [
  { name: 'Mon', count: 42 },
  { name: 'Tue', count: 38 },
  { name: 'Wed', count: 45 },
  { name: 'Thu', count: 44 },
  { name: 'Fri', count: 40 },
];

const payrollData = [
  { month: 'Jan', amount: 45000 },
  { month: 'Feb', amount: 52000 },
  { month: 'Mar', amount: 48000 },
  { month: 'Apr', amount: 61000 },
  { month: 'May', amount: 55000 },
];

export default function Dashboard({ user }: { user: any }) {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (user.role === 'admin' || user.role === 'manager') {
      // Mock summary data
      const mockSummary = {
        totalEmployees: 3,
        totalDepartments: mockDepartments.length,
        pendingLeaves: 2,
        todayAttendance: mockAttendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length
      };
      setSummary(mockSummary);
    }
  }, [user.role]);

  const canSeeStats = user.role === 'admin' || user.role === 'manager';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-gray-500">Track organization performance.</p>
      </div>

      {canSeeStats && summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard 
            title="Total Employees" 
            value={summary.totalEmployees} 
            icon={Users} 
            trend="+12%" 
            isPositive={true} 
          />
          <StatCard 
            title="Departments" 
            value={summary.totalDepartments} 
            icon={Calendar} 
            trend="+2" 
            isPositive={true} 
          />
          <StatCard 
            title="Today's Attendance" 
            value={summary.todayAttendance} 
            icon={Clock} 
            trend="-4%" 
            isPositive={false} 
          />
          <StatCard 
            title="Pending Requests" 
            value={summary.pendingLeaves} 
            icon={TrendingUp} 
            trend={summary.pendingLeaves > 0 ? "Action Required" : "All Clear"} 
            isNeutral={true} 
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Weekly Attendance</h3>
            <select className="text-sm border-none bg-gray-50 rounded-lg px-2 py-1 focus:ring-0">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94A3B8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94A3B8'}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Payroll Trends</h3>
            <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payrollData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94A3B8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94A3B8'}} />
                <RechartsTooltip 
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {!canSeeStats && (
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold mb-2">Ready to start your day?</h3>
            <p className="text-indigo-100 mb-6 font-light">Don't forget to mark your attendance. Your current status helps us keep track of your well-being and productivity!</p>
            <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg active:scale-95">
              Check Attendance Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, isPositive, isNeutral }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-gray-50 rounded-xl">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        {!isNeutral && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
          )}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
        {isNeutral && (
          <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold">{value}</h4>
      </div>
    </div>
  );
}

import { cn } from '../lib/utils';
