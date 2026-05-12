// Client-side employee management
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department_id?: string;
  created_at: string;
}

// Mock employee database
let mockEmployees: Employee[] = [
  {
    id: 'emp-001',
    name: 'John Smith',
    email: 'john.smith@hrpulse.com',
    role: 'employee',
    department_id: 'dept-001',
    created_at: new Date('2024-01-15').toISOString()
  },
  {
    id: 'emp-002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@hrpulse.com',
    role: 'manager',
    department_id: 'dept-002',
    created_at: new Date('2024-02-20').toISOString()
  },
  {
    id: 'emp-003',
    name: 'Mike Wilson',
    email: 'mike.wilson@hrpulse.com',
    role: 'employee',
    department_id: 'dept-001',
    created_at: new Date('2024-03-10').toISOString()
  }
];

// Client-side employee operations
export async function getEmployees(): Promise<Employee[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockEmployees];
}

export async function addEmployee(employeeData: Omit<Employee, 'id' | 'created_at'>): Promise<Employee> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newEmployee: Employee = {
    ...employeeData,
    id: `emp-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  
  mockEmployees.push(newEmployee);
  return newEmployee;
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const index = mockEmployees.findIndex(emp => emp.id === id);
  if (index === -1) {
    throw new Error('Employee not found');
  }
  
  mockEmployees[index] = { ...mockEmployees[index], ...updates };
  return mockEmployees[index];
}

export async function deleteEmployee(id: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockEmployees.findIndex(emp => emp.id === id);
  if (index === -1) {
    throw new Error('Employee not found');
  }
  
  mockEmployees.splice(index, 1);
}
