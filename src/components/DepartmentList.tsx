import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  MoreVertical,
  Building2,
  Users,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { mockDepartments } from '../lib/mockData';

export default function DepartmentList({ user }: { user: any }) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', manager_id: '', description: '' });

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setDepartments(mockDepartments);
      setEmployees([]); // We'll use mock employees from employee component
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsAddOpen(false);
      setFormData({ name: '', manager_id: '', description: '' });
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
          <p className="text-gray-500">Manage organizational units and teams.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAddOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Department
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse h-48"></div>
          ))
        ) : departments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 font-medium italic">
            No departments found.
          </div>
        ) : (
          departments.map((dept) => (
            <div key={dept.id} className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <button className="p-2 hover:bg-gray-50 rounded-lg">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{dept.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{dept.description || 'No description provided.'}</p>
              
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                    <Users className="w-3 h-3 text-gray-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {employees.find(e => e.id === dept.manager_id)?.name || 'Needs Manager'}
                  </span>
                </div>
                <span className="text-xs font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded">
                  {employees.filter(e => e.department_id === dept.id).length} Members
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">New Department</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Department Name</label>
                 <input 
                   required
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                   placeholder="e.g. Engineering, HR"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Assign Manager</label>
                 <select 
                   value={formData.manager_id}
                   onChange={e => setFormData({...formData, manager_id: e.target.value})}
                   className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                 >
                   <option value="">Select Manager</option>
                   {employees.map(emp => (
                     <option key={emp.id} value={emp.id}>{emp.name}</option>
                   ))}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Description</label>
                 <textarea 
                   rows={3}
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                   placeholder="Purpose of this department..."
                 />
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
                   className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95"
                 >
                   Save Department
                 </button>
               </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
