import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone,
  UserPlus,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { getEmployees, addEmployee } from '../lib/employees';

export default function EmployeeList({ user }: { user: any }) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsSubmitting(true);
    try {
      await addEmployee({
        name: formData.name,
        email: formData.email,
        role: formData.role as 'admin' | 'manager' | 'employee'
      });
      setIsAddOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'employee' });
      loadEmployees();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
          <p className="text-gray-500">Manage your workforce directory.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAddOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E9ECEF] flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, email..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
          <Filter className="w-4 h-4 text-gray-500" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-bottom border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Employee</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Department</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Joined Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 w-48 bg-gray-100 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-100 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-100 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-100 rounded"></div></td>
                    <td className="px-6 py-4 text-right"><div className="ml-auto h-6 w-6 bg-gray-100 rounded"></div></td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No employees found.</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                          {emp.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                        {emp.department_id || 'Not Assigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize text-sm">{emp.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(emp.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick Stats Overlay (Optional) */}
      <div className="flex flex-col sm:flex-row gap-4">
         <div className="flex-1 bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center gap-4">
           <div className="p-3 bg-white rounded-xl shadow-sm">
             <UserPlus className="w-6 h-6 text-indigo-600" />
           </div>
           <div>
             <h4 className="font-bold text-xl">{employees.length}</h4>
             <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider">Active Members</p>
           </div>
         </div>
         <div className="flex-1 bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center gap-4">
           <div className="p-3 bg-white rounded-xl shadow-sm">
             <Mail className="w-6 h-6 text-emerald-600" />
           </div>
           <div>
             <h4 className="font-bold text-xl">100%</h4>
             <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">Email Verified</p>
           </div>
         </div>
      </div>
      
      {/* Add Employee Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6"
          >
             <div className="flex justify-between items-center">
               <h3 className="text-2xl font-bold">New Employee</h3>
               <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                 <X className="w-6 h-6" />
               </button>
             </div>
             
             <form onSubmit={handleAddEmployee} className="space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                 <input 
                   required
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                   placeholder="John Doe"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                 <input 
                   required
                   type="email"
                   value={formData.email}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                   className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                   placeholder="john@company.com"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Temporary Password</label>
                 <input 
                   required
                   type="password"
                   value={formData.password}
                   onChange={e => setFormData({...formData, password: e.target.value})}
                   className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                   placeholder="••••••••"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Role</label>
                 <select 
                   value={formData.role}
                   onChange={e => setFormData({...formData, role: e.target.value})}
                   className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                 >
                   <option value="employee">Employee</option>
                   <option value="admin">Admin</option>
                   <option value="manager">Manager</option>
                 </select>
               </div>
               
               <div className="pt-4 flex gap-3">
                 <button 
                   type="button"
                   onClick={() => setIsAddOpen(false)}
                   className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={isSubmitting}
                   className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                 >
                   {isSubmitting ? 'Adding...' : 'Create Account'}
                 </button>
               </div>
             </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
