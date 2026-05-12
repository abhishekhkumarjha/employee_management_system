// Client-side authentication with mock data
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Mock user database
const mockUsers: User[] = [
  {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@hrpulse.com',
    role: 'admin'
  },
  {
    id: 'manager-001',
    name: 'Manager User',
    email: 'manager@hrpulse.com',
    role: 'manager'
  },
  {
    id: 'employee-001',
    name: 'Employee User',
    email: 'employee@hrpulse.com',
    role: 'employee'
  }
];

// Mock password storage (in real app, this would be hashed)
const mockPasswords: Record<string, string> = {
  'admin@hrpulse.com': 'admin123',
  'manager@hrpulse.com': 'manager123',
  'employee@hrpulse.com': 'employee123'
};

// Generate a simple JWT-like token (for demo purposes)
function generateToken(user: User): string {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
  };
  
  return btoa(JSON.stringify(payload));
}

// Verify token
export function verifyToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp > Date.now()) {
      return {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Client-side login function
export async function clientLogin(email: string, password: string): Promise<AuthResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return {
      success: false,
      message: "User not found"
    };
  }

  const storedPassword = mockPasswords[email];
  if (password !== storedPassword) {
    return {
      success: false,
      message: "Invalid password"
    };
  }

  const token = generateToken(user);

  return {
    success: true,
    user,
    token
  };
}

// Get current user from localStorage
export function getCurrentUser(): User | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  return verifyToken(token);
}

// Logout function
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
