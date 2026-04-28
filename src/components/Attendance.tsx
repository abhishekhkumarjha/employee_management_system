import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  Clock, 
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { cn } from '../lib/utils';

export default function Attendance({ user }: { user: any }) {
  const [status, setStatus] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadStatus();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadStatus = async () => {
    try {
      const data = await apiFetch('/attendance/status');
      setStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckIn = async () => {
    try {
      await apiFetch('/attendance/check-in', { method: 'POST' });
      loadStatus();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      await apiFetch('/attendance/check-out', { method: 'POST' });
      loadStatus();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const isCheckedIn = status && status.clock_in && !status.clock_out;
  const isCheckedOut = status && status.clock_out;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Attendance Center</h2>
        <p className="text-gray-500">Record your working hours for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl border border-[#E9ECEF] p-8 shadow-sm space-y-8">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="text-6xl font-mono font-bold text-gray-900 tracking-tighter">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <CalendarIcon className="w-4 h-4" />
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ActionButton 
              title="Clock In" 
              icon={LogIn} 
              active={!isCheckedIn && !isCheckedOut} 
              onClick={handleCheckIn}
              color="indigo"
              disabled={isCheckedIn || isCheckedOut}
            />
            <ActionButton 
              title="Clock Out" 
              icon={LogOut} 
              active={isCheckedIn} 
              onClick={handleCheckOut}
              color="rose"
              disabled={!isCheckedIn || isCheckedOut}
            />
          </div>

          {isCheckedOut && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm font-medium">Great job! You've successfully completed your shift for today.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#E9ECEF] p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Today's Summary</h3>
            <div className="space-y-4">
              <SummaryRow 
                label="Check In" 
                value={status?.clock_in ? new Date(status.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} 
                icon={Clock}
              />
              <SummaryRow 
                label="Check Out" 
                value={status?.clock_out ? new Date(status.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} 
                icon={LogOut}
              />
              <div className="h-px bg-gray-100 my-2"></div>
              <SummaryRow 
                label="Status" 
                value={status?.status || 'Not Started'} 
                isStatus
              />
            </div>
          </div>

          <div className="bg-gray-900 rounded-3xl p-6 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-4">Health Tip</h3>
              <p className="text-sm text-gray-400 font-light italic leading-relaxed">
                Remember to take short breaks every hour. Stretching your eyes and back improves long-term productivity!
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-[#E9ECEF] p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-6">Recent Log</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
             <div className="flex items-center gap-4">
               <div className="p-2 bg-white rounded-xl shadow-sm">
                 <Clock className="w-5 h-5 text-indigo-600" />
               </div>
               <div>
                  <p className="font-semibold text-sm">Yesterday</p>
                  <p className="text-xs text-gray-500">April 24, 2026</p>
               </div>
             </div>
             <div className="text-right">
               <p className="font-bold text-sm">08:45 AM - 05:30 PM</p>
               <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Present</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ title, icon: Icon, active, onClick, color, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        active 
          ? color === 'indigo' ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200"
          : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
      )}
    >
      <Icon className="w-8 h-8" />
      <span className="font-bold text-sm uppercase tracking-wide">{title}</span>
    </button>
  );
}

function SummaryRow({ label, value, icon: Icon, isStatus }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <span className={cn(
        "font-bold text-sm",
        isStatus && value === 'present' ? "text-emerald-600 uppercase" : "text-gray-900"
      )}>
        {value}
      </span>
    </div>
  );
}
