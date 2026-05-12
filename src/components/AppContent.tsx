import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CreditCard, 
  Settings as SettingsIcon, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import Dashboard from './Dashboard';
import EmployeeList from './EmployeeList';
import Attendance from './Attendance';
import Payroll from './Payroll';
import DepartmentList from './DepartmentList';
import Settings from './Settings';
import Login from './Login';
import { getCurrentUser } from '../lib/auth';

type View = 'dashboard' | 'employees' | 'attendance' | 'payroll' | 'departments' | 'settings';
type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Mock notifications for demo
    const mockNotifications: AppNotification[] = [
      {
        id: '1',
        title: 'Welcome to HRPulse',
        message: 'Your account has been successfully created and configured.',
        type: 'success',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'System Update',
        message: 'New features have been added to improve your experience.',
        type: 'info',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    setNotifications(mockNotifications);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setNotifications([]);
    setUser(null);
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const handleToggleNotifications = () => {
    const shouldOpen = !isNotificationsOpen;
    setIsNotificationsOpen(shouldOpen);

    if (shouldOpen && unreadCount > 0) {
      // Mark all notifications as read
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    }
  };

  if (!user) {
    return <Login onLogin={(u: any) => setUser(u)} />;
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'payroll', label: 'Payroll', icon: CreditCard },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const filteredItems = sidebarItems;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-[#1A1A1A]">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E9ECEF] flex flex-col transition-all duration-300",
              !isSidebarOpen && "w-0 overflow-hidden border-none"
            )}
          >
            <div className="p-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                H
              </div>
              <h1 className="text-xl font-bold tracking-tight">HRPulse</h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as View);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    currentView === item.id 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-[#E9ECEF]">
              <div className="flex items-center gap-3 px-3 py-4 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                  {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        isSidebarOpen && !isMobile ? "pl-64" : "pl-0"
      )}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E9ECEF] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <button
                onClick={handleToggleNotifications}
                className="p-2 hover:bg-gray-100 rounded-lg relative"
                aria-label="Open notifications"
              >
                <Bell className="w-5 h-5 text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-2xl border border-[#E9ECEF] shadow-xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <p className="font-bold text-sm">Notifications</p>
                      <button
                        onClick={() => {
                          setCurrentView('settings');
                          setIsNotificationsOpen(false);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Settings
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm font-semibold text-gray-700">No notifications</p>
                          <p className="text-xs text-gray-500 mt-1">You are all caught up.</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div key={notification.id} className="px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50">
                            <div className="flex items-start gap-3">
                              <span className={cn(
                                "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
                                notification.isRead ? "bg-gray-300" : "bg-indigo-600"
                              )}></span>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900">{notification.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                                <p className="text-[11px] text-gray-400 mt-2">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden sm:inline-block">Welcome, {user.name.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && <Dashboard user={user} />}
              {currentView === 'employees' && <EmployeeList user={user} />}
              {currentView === 'attendance' && <Attendance user={user} />}
              {currentView === 'payroll' && <Payroll user={user} />}
              {currentView === 'departments' && <DepartmentList user={user} />}
              {currentView === 'settings' && <Settings user={user} onUpdateUser={setUser} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
