// Mock data for all components
export interface Department {
  id: string;
  name: string;
  manager_id?: string;
  description?: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  status: 'present' | 'absent' | 'late';
}

export interface PayrollRecord {
  id: string;
  user_id: string;
  amount: number;
  period: string;
  status: 'pending' | 'paid' | 'processing';
  created_at: string;
}

export interface NotificationPreference {
  emailNotifications: boolean;
  browserNotifications: boolean;
  smsAlerts: boolean;
}

// Mock departments
export const mockDepartments: Department[] = [
  {
    id: 'dept-001',
    name: 'Engineering',
    manager_id: 'emp-002',
    description: 'Software development and technology'
  },
  {
    id: 'dept-002',
    name: 'Human Resources',
    manager_id: 'emp-002',
    description: 'Employee management and relations'
  },
  {
    id: 'dept-003',
    name: 'Marketing',
    description: 'Brand management and promotion'
  }
];

// Mock attendance records
export const mockAttendance: AttendanceRecord[] = [
  {
    id: 'att-001',
    user_id: 'emp-001',
    date: new Date().toISOString().split('T')[0],
    clock_in: '09:00:00',
    clock_out: '17:00:00',
    status: 'present'
  },
  {
    id: 'att-002',
    user_id: 'emp-002',
    date: new Date().toISOString().split('T')[0],
    clock_in: '08:45:00',
    status: 'present'
  }
];

// Mock payroll records
export const mockPayroll: PayrollRecord[] = [
  {
    id: 'pay-001',
    user_id: 'emp-001',
    amount: 5000,
    period: '2024-05',
    status: 'paid',
    created_at: new Date('2024-05-01').toISOString()
  },
  {
    id: 'pay-002',
    user_id: 'emp-002',
    amount: 6500,
    period: '2024-05',
    status: 'paid',
    created_at: new Date('2024-05-01').toISOString()
  },
  {
    id: 'pay-003',
    user_id: 'emp-003',
    amount: 4500,
    period: '2024-05',
    status: 'pending',
    created_at: new Date('2024-05-01').toISOString()
  }
];

// Mock notification preferences
export const mockNotificationPreferences: NotificationPreference = {
  emailNotifications: true,
  browserNotifications: true,
  smsAlerts: false
};
