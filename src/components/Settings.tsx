import React, { useEffect, useState } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Shield, 
  Bell,
  Save,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockNotificationPreferences } from '../lib/mockData';

export default function Settings({ user, onUpdateUser }: { user: any, onUpdateUser: (u: any) => void }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    browserNotifications: false,
    smsAlerts: false
  });
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Simulate API delay
    const loadNotificationPrefs = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotificationPrefs(mockNotificationPreferences);
    };
    loadNotificationPrefs();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUpdateUser({ ...user, name: formData.name, email: formData.email });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsSaving(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = async (key: keyof typeof notificationPrefs, value: boolean) => {
    if (key === 'browserNotifications' && value && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return alert('Browser notifications were not enabled because permission was denied.');
      }

      new Notification('HRPulse notifications enabled', {
        body: 'You will receive browser alerts for important updates.'
      });
    }

    const nextPrefs = { ...notificationPrefs, [key]: value };
    setIsSaving(true);
    setSuccess(false);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setNotificationPrefs(notificationPrefs);
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-gray-500">Manage your account preferences and security.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation */}
        <aside className="w-full lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                activeTab === tab.id 
                  ? "bg-white text-indigo-600 shadow-sm border border-gray-100" 
                  : "text-gray-500 hover:bg-white/50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="flex-1 bg-white rounded-3xl border border-[#E9ECEF] shadow-sm p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.form 
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleProfileUpdate}
                className="space-y-6"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-indigo-600">
                    {user.name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Profile Picture</h3>
                    <p className="text-sm text-gray-500 mb-2">Upload a professional photo.</p>
                    <button type="button" className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline">Change Avatar</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                    <input 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                    <input 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  {success && (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold animate-in fade-in slide-in-from-left-2">
                       <CheckCircle2 className="w-4 h-4" />
                       Changes saved!
                    </div>
                  )}
                  <div className="flex-1"></div>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </motion.form>
            )}

            {activeTab === 'security' && (
              <motion.form 
                key="security"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handlePasswordUpdate}
                className="space-y-6"
              >
                 <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 rounded-2xl flex items-start gap-3 border border-indigo-100">
                      <Shield className="w-5 h-5 text-indigo-600 mt-1" />
                      <div>
                        <p className="text-sm font-bold text-indigo-900">Password Security</p>
                        <p className="text-xs text-indigo-700 font-medium opacity-80">Use at least 8 characters with a mix of letters, numbers, and symbols.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Password</label>
                      <input 
                        type="password"
                        value={formData.currentPassword}
                        onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">New Password</label>
                        <input 
                          type="password"
                          value={formData.newPassword}
                          onChange={e => setFormData({...formData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Confirm New</label>
                        <input 
                          type="password"
                          value={formData.confirmPassword}
                          onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                        />
                      </div>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  {success && (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                       <CheckCircle2 className="w-4 h-4" />
                       Password updated!
                    </div>
                  )}
                  <div className="flex-1"></div>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    {isSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </motion.form>
            )}

            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <NotificationToggle
                    title="Email Notifications"
                    description="Receive payroll and attendance alerts via email."
                    active={notificationPrefs.emailNotifications}
                    disabled={isSaving}
                    onChange={(value: boolean) => handleNotificationChange('emailNotifications', value)}
                  />
                  <NotificationToggle
                    title="Browser Notifications"
                    description="Get real-time alerts in your web browser."
                    active={notificationPrefs.browserNotifications}
                    disabled={isSaving}
                    onChange={(value: boolean) => handleNotificationChange('browserNotifications', value)}
                  />
                  <NotificationToggle
                    title="SMS Alerts"
                    description="Receive emergency announcements on your phone."
                    active={notificationPrefs.smsAlerts}
                    disabled={isSaving}
                    onChange={(value: boolean) => handleNotificationChange('smsAlerts', value)}
                  />
                </div>
                {success && (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Notification preferences saved!
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function NotificationToggle({ title, description, active, disabled, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div>
        <p className="font-bold text-sm text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 font-medium">{description}</p>
      </div>
      <button 
        type="button"
        disabled={disabled}
        onClick={() => onChange(!active)}
        className={cn(
          "w-12 h-6 rounded-full transition-all relative disabled:opacity-60",
          active ? "bg-indigo-600" : "bg-gray-300"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
          active ? "left-7" : "left-1"
        )}></div>
      </button>
    </div>
  );
}

import { cn } from '../lib/utils';
