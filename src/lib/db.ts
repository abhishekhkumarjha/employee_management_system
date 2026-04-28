import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'database.sqlite');

// Ensure the database file exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'employee',
    department_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments (id)
  );

  CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    manager_id TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    clock_in DATETIME,
    clock_out DATETIME,
    status TEXT, -- 'present', 'absent', 'late', 'leave'
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS payroll (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    month TEXT NOT NULL, -- e.g., '2024-05'
    base_salary REAL NOT NULL,
    bonus REAL DEFAULT 0,
    deductions REAL DEFAULT 0,
    net_salary REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'paid'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS leaves (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type TEXT NOT NULL, -- 'sick', 'vacation', 'other'
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id TEXT PRIMARY KEY,
    email_notifications INTEGER DEFAULT 1,
    browser_notifications INTEGER DEFAULT 0,
    sms_alerts INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// Add default admin if not exists
const adminId = 'admin-001';
const adminEmail = 'admin@hrpulse.com';
const adminPasswordHash = bcrypt.hashSync('admin123', 10);

const checkDept = db.prepare('SELECT id FROM departments LIMIT 1').get();
if (!checkDept) {
  db.prepare('INSERT INTO departments (id, name, description) VALUES (?, ?, ?)').run('d1', 'Engineering', 'Software development and infrastructure.');
  db.prepare('INSERT INTO departments (id, name, description) VALUES (?, ?, ?)').run('d2', 'Human Resources', 'Talent acquisition and employee relations.');
  db.prepare('INSERT INTO departments (id, name, description) VALUES (?, ?, ?)').run('d3', 'Marketing', 'Brand awareness and lead generation.');
}

const checkAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
if (!checkAdmin) {
  db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(
    adminId,
    'System Admin',
    adminEmail,
    adminPasswordHash,
    'admin'
  );
} else {
  // Ensure password is correct for the demo admin
  db.prepare('UPDATE users SET password = ? WHERE email = ?').run(adminPasswordHash, adminEmail);
}

db.prepare('INSERT OR IGNORE INTO notification_preferences (user_id) VALUES (?)').run(adminId);

const checkNotifications = db.prepare('SELECT id FROM notifications WHERE user_id = ? LIMIT 1').get(adminId);
if (!checkNotifications) {
  db.prepare('INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)')
    .run('n1', adminId, 'Payroll processed', 'April payroll has been marked as paid.', 'payroll');
  db.prepare('INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)')
    .run('n2', adminId, 'Attendance reminder', 'Review today attendance records before closing.', 'attendance');
}

// Add some mock payroll data for the admin to see
const checkPayroll = db.prepare('SELECT id FROM payroll LIMIT 1').get();
if (!checkPayroll) {
   db.prepare('INSERT INTO payroll (id, user_id, month, base_salary, bonus, deductions, net_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
     .run('p1', adminId, '2026-03', 5000, 500, 200, 5300, 'paid');
   db.prepare('INSERT INTO payroll (id, user_id, month, base_salary, bonus, deductions, net_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
     .run('p2', adminId, '2026-04', 5000, 0, 200, 4800, 'paid');
}

export default db;
