import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db from "./src/lib/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-very-secret-key";
const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      database: "sqlite",
      uptime: process.uptime(),
    });
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) return res.status(400).json({ message: "User not found" });

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  // Profile Management
  app.put("/api/profile/update", authenticateToken, (req, res) => {
    const { id } = (req as any).user;
    const { name, email } = req.body;

    try {
      db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);
      res.json({ name, email });
    } catch (e: any) {
      res.status(400).json({ message: "Email may already be in use" });
    }
  });

  app.put("/api/profile/password", authenticateToken, (req, res) => {
    const { id } = (req as any).user;
    const { currentPassword, newPassword } = req.body;

    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(id) as any;
    const validCurrent = bcrypt.compareSync(currentPassword, user.password);

    if (!validCurrent) return res.status(400).json({ message: "Current password incorrect" });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, id);
    res.json({ message: "Password updated successfully" });
  });

  // Notifications
  app.get("/api/notifications/preferences", authenticateToken, (req, res) => {
    const { id } = (req as any).user;
    db.prepare('INSERT OR IGNORE INTO notification_preferences (user_id) VALUES (?)').run(id);

    const prefs = db.prepare('SELECT * FROM notification_preferences WHERE user_id = ?').get(id) as any;
    res.json({
      emailNotifications: Boolean(prefs.email_notifications),
      browserNotifications: Boolean(prefs.browser_notifications),
      smsAlerts: Boolean(prefs.sms_alerts),
    });
  });

  app.put("/api/notifications/preferences", authenticateToken, (req, res) => {
    const { id } = (req as any).user;
    const { emailNotifications, browserNotifications, smsAlerts } = req.body;

    db.prepare(`
      INSERT INTO notification_preferences (
        user_id,
        email_notifications,
        browser_notifications,
        sms_alerts,
        updated_at
      )
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        email_notifications = excluded.email_notifications,
        browser_notifications = excluded.browser_notifications,
        sms_alerts = excluded.sms_alerts,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      id,
      emailNotifications ? 1 : 0,
      browserNotifications ? 1 : 0,
      smsAlerts ? 1 : 0
    );

    res.json({ emailNotifications, browserNotifications, smsAlerts });
  });

  app.get("/api/notifications", authenticateToken, (req, res) => {
    const { id } = (req as any).user;
    const notifications = db.prepare(`
      SELECT id, title, message, type, is_read as isRead, created_at as createdAt
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(id);

    res.json(notifications.map((notification: any) => ({
      ...notification,
      isRead: Boolean(notification.isRead),
    })));
  });

  app.put("/api/notifications/read", authenticateToken, (req, res) => {
    const { id } = (req as any).user;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(id);
    res.json({ message: "Notifications marked as read" });
  });

  // Employees
  app.get("/api/employees", authenticateToken, (req, res) => {
    const { role } = (req as any).user;
    if (role !== 'admin' && role !== 'manager') return res.sendStatus(403);
    
    const employees = db.prepare('SELECT id, name, email, role, department_id, created_at FROM users').all();
    res.json(employees);
  });

  app.post("/api/employees", authenticateToken, (req, res) => {
    if ((req as any).user.role !== 'admin') return res.status(403).json({ message: "Only Admins can add employees" });
    const { name, email, password, role, department_id } = req.body;
    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
      db.prepare('INSERT INTO users (id, name, email, password, role, department_id) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, name, email, hashedPassword, role || 'employee', department_id);
      res.status(201).json({ id, name, email, role, department_id });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Departments
  app.get("/api/departments", authenticateToken, (req, res) => {
    const depts = db.prepare('SELECT * FROM departments').all();
    res.json(depts);
  });

  app.post("/api/departments", authenticateToken, (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const { name, manager_id, description } = req.body;
    const id = uuidv4();
    try {
      db.prepare('INSERT INTO departments (id, name, manager_id, description) VALUES (?, ?, ?, ?)')
        .run(id, name, manager_id, description);
      res.status(201).json({ id, name, manager_id, description });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Attendance
  app.post("/api/attendance/check-in", authenticateToken, (req, res) => {
    const userId = (req as any).user.id;
    const date = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const id = uuidv4();

    try {
      const existing = db.prepare('SELECT id FROM attendance WHERE user_id = ? AND date = ?').get(userId, date);
      if (existing) return res.status(400).json({ message: "Already checked in today" });

      db.prepare('INSERT INTO attendance (id, user_id, date, clock_in, status) VALUES (?, ?, ?, ?, ?)')
        .run(id, userId, date, now, 'present');
      res.json({ message: "Checked in successfully" });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/attendance/check-out", authenticateToken, (req, res) => {
    const userId = (req as any).user.id;
    const date = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    try {
      const existing = db.prepare('SELECT id FROM attendance WHERE user_id = ? AND date = ?').get(userId, date) as any;
      if (!existing) return res.status(400).json({ message: "Not checked in today" });

      db.prepare('UPDATE attendance SET clock_out = ? WHERE id = ?').run(now, existing.id);
      res.json({ message: "Checked out successfully" });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/attendance/status", authenticateToken, (req, res) => {
    const userId = (req as any).user.id;
    const date = new Date().toISOString().split('T')[0];
    const status = db.prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?').get(userId, date);
    res.json(status || null);
  });

  // Payroll
  app.get("/api/payroll", authenticateToken, (req, res) => {
    const { role, id } = (req as any).user;
    let query = 'SELECT p.*, u.name as user_name FROM payroll p JOIN users u ON p.user_id = u.id';
    let params: any[] = [];
    
    if (role !== 'admin') {
      query += ' WHERE p.user_id = ?';
      params.push(id);
    }
    
    const records = db.prepare(query).all(...params);
    res.json(records);
  });

  // Analytics (Admin & Manager)
  app.get("/api/analytics/summary", authenticateToken, (req, res) => {
    const { role } = (req as any).user;
    if (role !== 'admin' && role !== 'manager') return res.sendStatus(403);
    
    const totalEmployees = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    const totalDepartments = (db.prepare('SELECT COUNT(*) as count FROM departments').get() as any).count;
    const pendingLeaves = (db.prepare('SELECT COUNT(*) as count FROM leaves WHERE status = ?').get('pending') as any).count;
    
    // Attendance for today
    const date = new Date().toISOString().split('T')[0];
    const todayAttendance = (db.prepare('SELECT COUNT(*) as count FROM attendance WHERE date = ?').get(date) as any).count;

    res.json({
      totalEmployees,
      totalDepartments,
      pendingLeaves,
      todayAttendance
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
