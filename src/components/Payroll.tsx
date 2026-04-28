import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Download, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function Payroll({ user }: { user: any }) {
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = async () => {
    try {
      const data = await apiFetch('/payroll');
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll</h2>
          <p className="text-gray-500">Manage salary processing and view payslips.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            Filter History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E9ECEF] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold">Payment History</h3>
              <button className="text-sm text-indigo-600 font-bold flex items-center gap-1">
                Download All <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Period</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Net Salary</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-6"><div className="h-4 w-24 bg-gray-100 rounded"></div></td>
                        <td className="px-6 py-6"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                        <td className="px-6 py-6"><div className="h-4 w-12 bg-gray-100 rounded"></div></td>
                        <td className="px-6 py-6"><div className="h-4 w-4 bg-gray-100 ml-auto rounded"></div></td>
                      </tr>
                    ))
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic font-medium whitespace-pre-wrap">No payroll records generated yet.{"\n"}Check back after the billing cycle ends.</td>
                    </tr>
                  ) : (
                    records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{new Date(rec.month + '-01').toLocaleDateString([], { month: 'long', year: 'numeric' })}</p>
                          <p className="text-xs text-gray-400">Paid on {new Date(rec.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-indigo-600">${rec.net_salary.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-full">
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-indigo-600 hover:text-indigo-800 transition-colors">
                            <Download className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[200px]">
              <div>
                <DollarSign className="w-10 h-10 text-emerald-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Estimated Salary</h3>
                <p className="text-gray-400 text-sm font-light mb-6">Based on your current performance and base salary including expected bonuses.</p>
              </div>
              <div className="flex items-end justify-between">
                 <div>
                   <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Current Cycle</p>
                   <p className="text-3xl font-bold">$4,850.00</p>
                 </div>
                 <ArrowRight className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16"></div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E9ECEF] p-6 shadow-sm space-y-4">
             <div className="flex items-center gap-3">
               <ShieldCheck className="w-5 h-5 text-indigo-600" />
               <h4 className="font-bold text-sm uppercase tracking-wide">Secure Transfers</h4>
             </div>
             <p className="text-xs text-gray-500 leading-relaxed">
               Your salary is processed through our encrypted banking gateway. Settlements usually occur within 2-3 business days of the payout date.
             </p>
             <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 cursor-pointer hover:underline">
               Learn more about payouts <Zap className="w-3 h-3" />
             </div>
          </div>
        </div>
      </div>
      
      {/* Informative Footer */}
      <div className="flex items-start gap-4 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
         <Info className="w-6 h-6 text-indigo-600 shrink-0 mt-1" />
         <div className="space-y-1">
            <h5 className="font-bold text-indigo-900">Tax Document Notice</h5>
            <p className="text-sm text-indigo-700 leading-relaxed font-medium opacity-80">
              Tax year 2026 documents (Form W-2 / P60) will be available for download starting January 15th, 2027. Please ensure your mailing address is up to date in the profile settings.
            </p>
         </div>
      </div>
    </div>
  );
}
