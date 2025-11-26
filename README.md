# Employee Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen.svg)

A comprehensive employee management system designed to streamline HR operations and employee data management. This system provides an intuitive interface for managing employee records, tracking attendance, handling payroll, and generating reports.

## 🚀 Features

- **Employee Profile Management**
  - Add, edit, and delete employee records
  - Store comprehensive employee information
  - Photo upload and management
  - Employee search and filtering

- **Attendance Tracking**
  - Clock in/out functionality
  - Attendance reports and analytics
  - Leave management system
  - Holiday calendar integration

- **Payroll Management**
  - Salary calculation and processing
  - Tax deductions and benefits
  - Payslip generation
  - Expense tracking

- **Department Management**
  - Organize employees by departments
  - Department-wise reporting
  - Manager assignments
  - Hierarchical structure

- **Reporting & Analytics**
  - Employee performance reports
  - Attendance summaries
  - Payroll reports
  - Export to PDF/Excel

- **User Authentication**
  - Secure login system
  - Role-based access control
  - Password encryption
  - Session management

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap
- **Backend**: FLASK (Python)
- **Database**: MySQL
- **Authentication**: JWT
- **Additional Libraries**: 
  - Chart.js for analytics
  - DataTables for data management
  - Font Awesome for icons

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Python 3.8+ 
- MySQL 5.7+ 


## 📁 Project Structure

```
employee_management_system/
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── config/
│   └── database.php
├── controllers/
├── models/
├── views/
├── database/
│   └── schema.sql
├── uploads/
├── includes/
├── index.php
└── README.md
```



## 📖 Usage

### Adding New Employees
1. Login as Admin/HR
2. Navigate to "Add Employee"
3. Fill in employee details
4. Upload profile photo (optional)
5. Save the record

### Managing Attendance
1. Employees can clock in/out from dashboard
2. HR can view attendance reports
3. Generate monthly attendance summaries

### Payroll Processing
1. Set up employee salary details
2. Configure deductions and benefits
3. Generate payslips monthly
4. Export payroll reports

## 🔐 Security Features

- Password hashing using bcrypt
- SQL injection prevention
- XSS protection
- CSRF token validation
- Session timeout
- File upload validation



## ✨ Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Employee Management
![Employee List](screenshots/employee-list.png)

### Attendance Tracking
![Attendance](screenshots/attendance.png)

## 🙏 Acknowledgments

- Thanks to all contributors
- Bootstrap for UI components
- Chart.js for analytics visualizations
- Font Awesome for icons

---

**Made with ❤️ by [Abhishek Kumar Jha](https://github.com/abhishekhkumarjha)**

## ⭐ Star this repository if you found it helpful!
