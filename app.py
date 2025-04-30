import os
import io
import csv
from flask import Flask, request, redirect, url_for, flash, render_template, session, jsonify, send_from_directory, Response
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime, date, timedelta
from sqlalchemy import and_, func
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SECURE'] = False  # False for development (no HTTPS)
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent JS access
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Mitigate CSRF
app.config['PERMANENT_SESSION_LIFETIME'] = 1800  # 30 minutes
db = SQLAlchemy(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

# Employee model
class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.String(10), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(50), nullable=False)
    avatar = db.Column(db.String(255), nullable=True)

# Attendance model
class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.String(10), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    clock_in = db.Column(db.String(10), nullable=True)
    clock_out = db.Column(db.String(10), nullable=True)
    status = db.Column(db.String(20), nullable=False)
    date = db.Column(db.Date, nullable=False, default=lambda: datetime.utcnow().date())
    image = db.Column(db.String(255), nullable=True)
    __table_args__ = (db.Index('idx_date_status', 'date', 'status'),)

# LeaveRequest model
class LeaveRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.String(10), unique=True, nullable=False)
    employee_name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    employee_image = db.Column(db.String(255), nullable=True)
    leave_type = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    days = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

# Create database and seed initial data
with app.app_context():
    try:
        db.create_all()
        # Seed initial employee data if empty
        if not Employee.query.first():
            initial_employees = [
                Employee(
                    employee_id='EMP001',
                    name='Aarav Sharma',
                    title='Software Engineer',
                    email='aarav.sharma@company.in',
                    department='IT',
                    location='Bengaluru',
                    avatar='https://via.placeholder.com/150'
                ),
                Employee(
                    employee_id='EMP002',
                    name='Priya Patel',
                    title='Product Manager',
                    email='priya.patel@company.in',
                    department='Product Management',
                    location='Mumbai',
                    avatar='https://via.placeholder.com/150'
                ),
                Employee(
                    employee_id='EMP003',
                    name='Rohan Gupta',
                    title='HR Specialist',
                    email='rohan.gupta@company.in',
                    department='Human Resources',
                    location='Delhi',
                    avatar='https://via.placeholder.com/150'
                ),
                Employee(
                    employee_id='EMP004',
                    name='Ananya Reddy',
                    title='Marketing Specialist',
                    email='ananya.reddy@company.in',
                    department='Marketing',
                    location='Hyderabad',
                    avatar='https://via.placeholder.com/150'
                ),
                Employee(
                    employee_id='EMP005',
                    name='Vikram Singh',
                    title='Data Analyst',
                    email='vikram.singh@company.in',
                    department='Analytics',
                    location='Pune',
                    avatar='https://via.placeholder.com/150'
                ),
                Employee(
                    employee_id='EMP006',
                    name='Sneha Nair',
                    title='Financial Analyst',
                    email='sneha.nair@company.in',
                    department='Finance',
                    location='Chennai',
                    avatar='https://via.placeholder.com/150'
                ),
                Employee(
                    employee_id='EMP007',
                    name='Rahul Verma',
                    title='DevOps Engineer',
                    email='rahul.verma@company.in',
                    department='IT',
                    location='Bengaluru',
                    avatar='https://via.placeholder.com/150'
                ),
                Employee(
                    employee_id='EMP008',
                    name='Meena Kumari',
                    title='Business Analyst',
                    email='meena.kumari@company.in',
                    department='Operations',
                    location='Ahmedabad',
                    avatar='https://via.placeholder.com/150'
                ),
                Employee(
                    employee_id='EMP009',
                    name='Amit Joshi',
                    title='Sales Manager',
                    email='amit.joshi@company.in',
                    department='Sales',
                    location='Kolkata',
                    avatar='https://via.placeholder.com/150'
                ),
                Employee(
                    employee_id='EMP010',
                    name='Riya Malhotra',
                    title='Customer Support Lead',
                    email='riya.malhotra@company.in',
                    department='Customer Service',
                    location='Gurugram',
                    avatar='https://via.placeholder.com/150'
                ),
                Employee(
                    employee_id='EMP011',
                    name='Karan Mehra',
                    title='Project Coordinator',
                    email='karan.mehra@company.in',
                    department='Project Management',
                    location='Noida',
                    avatar='https://via.placeholder.com/150'
                ),
                Employee(
                    employee_id='EMP012',
                    name='Pooja Desai',
                    title='Content Writer',
                    email='pooja.desai@company.in',
                    department='Marketing',
                    location='Jaipur',
                    avatar='https://via.placeholder.com/150'
                )
            ]
            db.session.bulk_save_objects(initial_employees)
            db.session.commit()
            logger.info("Employee data seeded successfully")

        # Seed initial attendance data if empty
        if not Attendance.query.first():
            employees = Employee.query.all()
            start_date = date(2025, 4, 30)  # Current date as per prompt
            statuses = ['present', 'late', 'leave', 'remote']
            initial_attendance = []
            for emp in employees:
                emp_index = int(emp.employee_id[-3:]) - 1
                status = statuses[emp_index % 4]  # Cycle through statuses
                clock_in = '09:00' if status in ['present', 'late'] else '--:--'
                clock_out = '17:30' if status in ['present', 'late'] else '--:--'
                if status == 'late':
                    clock_in = '09:45'
                initial_attendance.append(
                    Attendance(
                        employee_id=emp.employee_id,
                        name=emp.name,
                        department=emp.department,
                        clock_in=clock_in,
                        clock_out=clock_out,
                        status=status,
                        date=start_date,
                        image='https://via.placeholder.com/32'
                    )
                )
            db.session.bulk_save_objects(initial_attendance)
            db.session.commit()
            logger.info("Attendance data seeded successfully")

        # Seed initial leave request data if empty
        if not LeaveRequest.query.first():
            initial_leaves = [
                LeaveRequest(
                    request_id='LR001',
                    employee_name='Aarav Sharma',
                    department='IT',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Diwali Leave',
                    start_date=date(2025, 11, 12),
                    end_date=date(2025, 11, 15),
                    days=4,
                    status='pending'
                ),
                LeaveRequest(
                    request_id='LR002',
                    employee_name='Priya Patel',
                    department='Product Management',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Personal Leave',
                    start_date=date(2025, 4, 28),
                    end_date=date(2025, 4, 30),
                    days=3,
                    status='approved'
                ),
                LeaveRequest(
                    request_id='LR003',
                    employee_name='Rohan Gupta',
                    department='Human Resources',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Holi Leave',
                    start_date=date(2025, 3, 17),
                    end_date=date(2025, 3, 18),
                    days=2,
                    status='pending'
                ),
                LeaveRequest(
                    request_id='LR004',
                    employee_name='Ananya Reddy',
                    department='Marketing',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Sick Leave',
                    start_date=date(2025, 5, 10),
                    end_date=date(2025, 5, 12),
                    days=3,
                    status='approved'
                ),
                LeaveRequest(
                    request_id='LR005',
                    employee_name='Vikram Singh',
                    department='Analytics',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Republic Day',
                    start_date=date(2025, 1, 25),
                    end_date=date(2025, 1, 26),
                    days=2,
                    status='rejected'
                ),
                LeaveRequest(
                    request_id='LR006',
                    employee_name='Sneha Nair',
                    department='Finance',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Annual Leave',
                    start_date=date(2025, 6, 15),
                    end_date=date(2025, 6, 20),
                    days=6,
                    status='approved'
                ),
                LeaveRequest(
                    request_id='LR007',
                    employee_name='Rahul Verma',
                    department='IT',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Personal Leave',
                    start_date=date(2025, 7, 1),
                    end_date=date(2025, 7, 2),
                    days=2,
                    status='pending'
                ),
                LeaveRequest(
                    request_id='LR008',
                    employee_name='Meena Kumari',
                    department='Operations',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Sick Leave',
                    start_date=date(2025, 2, 10),
                    end_date=date(2025, 2, 11),
                    days=2,
                    status='approved'
                ),
                LeaveRequest(
                    request_id='LR009',
                    employee_name='Amit Joshi',
                    department='Sales',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Raksha Bandhan',
                    start_date=date(2025, 8, 9),
                    end_date=date(2025, 8, 10),
                    days=2,
                    status='rejected'
                ),
                LeaveRequest(
                    request_id='LR010',
                    employee_name='Riya Malhotra',
                    department='Customer Service',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Casual Leave',
                    start_date=date(2025, 9, 5),
                    end_date=date(2025, 9, 6),
                    days=2,
                    status='approved'
                ),
                LeaveRequest(
                    request_id='LR011',
                    employee_name='Karan Mehra',
                    department='Project Management',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Diwali Leave',
                    start_date=date(2025, 11, 13),
                    end_date=date(2025, 11, 14),
                    days=2,
                    status='pending'
                ),
                LeaveRequest(
                    request_id='LR012',
                    employee_name='Pooja Desai',
                    department='Marketing',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Holi Leave',
                    start_date=date(2025, 3, 17),
                    end_date=date(2025, 3, 17),
                    days=1,
                    status='approved'
                ),
                LeaveRequest(
                    request_id='LR013',
                    employee_name='Aarav Sharma',
                    department='IT',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Casual Leave',
                    start_date=date(2025, 10, 10),
                    end_date=date(2025, 10, 11),
                    days=2,
                    status='rejected'
                ),
                LeaveRequest(
                    request_id='LR014',
                    employee_name='Priya Patel',
                    department='Product Management',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Annual Leave',
                    start_date=date(2025, 12, 20),
                    end_date=date(2025, 12, 21),
                    days=2,
                    status='pending'
                ),
                LeaveRequest(
                    request_id='LR015',
                    employee_name='Rohan Gupta',
                    department='Human Resources',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Sick Leave',
                    start_date=date(2025, 4, 15),
                    end_date=date(2025, 4, 16),
                    days=2,
                    status='approved'
                ),
                LeaveRequest(
                    request_id='LR016',
                    employee_name='Ananya Reddy',
                    department='Marketing',
                    employee_image='https://via.placeholder.com/32',
                    leave_type='Ganesh Chaturthi',
                    start_date=date(2025, 8, 27),
                    end_date=date(2025, 8, 28),
                    days=2,
                    status='approved'
                )
            ]
            db.session.bulk_save_objects(initial_leaves)
            db.session.commit()
            logger.info("Leave request data seeded successfully")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating database: {e}")

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_email' not in session:
            flash('Please log in first!', 'error')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/signup', methods=['POST'])
def signup():
    email = request.form.get('email')
    password = request.form.get('password')
    
    try:
        if User.query.filter_by(email=email).first():
            flash('Email already registered!', 'error')
            return redirect(url_for('index'))
        
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        
        flash('Account created successfully! Please sign in.', 'success')
        return redirect(url_for('index'))
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error during signup: {e}")
        flash('Error creating account. Please try again.', 'error')
        return redirect(url_for('index'))

@app.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')
    try:
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            session['user_email'] = email
            session.permanent = True
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password!', 'error')
            return redirect(url_for('index'))
    except Exception as e:
        logger.error(f"Error during login: {e}")
        flash('Error logging in. Please try again.', 'error')
        return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user_email=session['user_email'])

@app.route('/attendance')
@login_required
def attendance():
    return render_template('attendance.html', user_email=session['user_email'])

@app.route('/leave')
@login_required
def leave():
    return render_template('leave.html', user_email=session['user_email'])

@app.route('/directory')
@login_required
def directory():
    return render_template('directory.html', user_email=session['user_email'])

@app.route('/salary')
@login_required
def salary():
    return render_template('salary.html', user_email=session['user_email'])

@app.route('/logout')
def logout():
    session.pop('user_email', None)
    flash('You have been logged out.', 'success')
    return redirect(url_for('index'))

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico')

# API to get employees
@app.route('/api/employees', methods=['GET'])
@login_required
def get_employees():
    try:
        employees = Employee.query.all()
        return jsonify([{
            'id': emp.id,
            'employee_id': emp.employee_id,
            'name': emp.name,
            'title': emp.title,
            'email': emp.email,
            'department': emp.department,
            'location': emp.location,
            'avatar': emp.avatar
        } for emp in employees])
    except Exception as e:
        logger.error(f"Error fetching employees: {e}")
        return jsonify({'error': str(e)}), 500

# API to add a new employee
@app.route('/api/employees', methods=['POST'])
@login_required
def add_employee():
    try:
        data = request.get_json()
        name = data.get('name')
        title = data.get('title')
        email = data.get('email')
        department = data.get('department')
        location = data.get('location')
        avatar = data.get('avatar', 'https://via.placeholder.com/150')

        if not all([name, title, email, department, location]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Validate email uniqueness
        if Employee.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400

        # Generate unique employee_id
        last_employee = Employee.query.order_by(Employee.id.desc()).first()
        last_id = int(last_employee.employee_id[-3:]) if last_employee else 0
        new_employee_id = f'EMP{str(last_id + 1).zfill(3)}'

        new_employee = Employee(
            employee_id=new_employee_id,
            name=name,
            title=title,
            email=email,
            department=department,
            location=location,
            avatar=avatar
        )
        db.session.add(new_employee)
        db.session.commit()

        return jsonify({'message': 'Employee added successfully', 'employee_id': new_employee_id}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding employee: {e}")
        return jsonify({'error': str(e)}), 500

# API to get attendance data
@app.route('/api/attendance', methods=['GET'])
@login_required
def get_attendance():
    try:
        filter_type = request.args.get('filter', 'today')
        limit = int(request.args.get('limit', 0))
        today = date(2025, 4, 30)  # Fixed date for consistency with seeding
        
        # Define date range based on filter
        if filter_type == 'today':
            start_date = today
            end_date = today
            chart_days = 1
        elif filter_type == 'week':
            start_date = today - timedelta(days=6)
            end_date = today
            chart_days = 7
        elif filter_type == 'month':
            start_date = today - timedelta(days=29)
            end_date = today
            chart_days = 30
        else:
            return jsonify({'error': 'Invalid filter type'}), 400

        # Chart data
        dates = [(start_date + timedelta(days=x)).strftime('%d-%m-%Y') for x in range(chart_days)]
        percentages = []
        for day in range(chart_days):
            current_date = start_date + timedelta(days=day)
            total = Attendance.query.filter_by(date=current_date).count()
            present = Attendance.query.filter_by(date=current_date, status='present').count()
            percentage = (present / total * 100) if total > 0 else 0
            percentages.append(round(percentage, 1))
        
        # Table data
        query = Attendance.query.filter(Attendance.date.between(start_date, end_date))
        if limit > 0:
            query = query.limit(limit)
        records = query.all()
        
        return jsonify({
            'dates': dates,
            'percentages': percentages,
            'records': [{
                'id': record.id,
                'employee_id': record.employee_id,
                'name': record.name,
                'date': record.date.strftime('%d-%m-%Y'),
                'status': record.status.capitalize(),
                'image': record.image
            } for record in records]
        })
    except Exception as e:
        logger.error(f"Error fetching attendance: {e}")
        return jsonify({'error': str(e)}), 500

# API to update attendance status
@app.route('/api/attendance/<int:id>', methods=['PUT'])
@login_required
def update_attendance(id):
    try:
        record = Attendance.query.get_or_404(id)
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['present', 'late', 'leave', 'remote']:
            return jsonify({'error': 'Invalid status'}), 400
            
        record.status = status
        db.session.commit()
        return jsonify({'message': 'Status updated successfully'})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating attendance: {e}")
        return jsonify({'error': str(e)}), 500

# API to delete attendance record
@app.route('/api/attendance/<int:id>', methods=['DELETE'])
@login_required
def delete_attendance(id):
    try:
        record = Attendance.query.get_or_404(id)
        db.session.delete(record)
        db.session.commit()
        return jsonify({'message': 'Record deleted successfully'})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting attendance: {e}")
        return jsonify({'error': str(e)}), 500

# API to export attendance data as CSV
@app.route('/api/attendance/export', methods=['GET'])
@login_required
def export_attendance():
    try:
        filter_type = request.args.get('filter', 'today')
        today = date(2025, 4, 30)  # Fixed date for consistency
        
        # Define date range based on filter
        if filter_type == 'today':
            start_date = today
            end_date = today
        elif filter_type == 'week':
            start_date = today - timedelta(days=6)
            end_date = today
        elif filter_type == 'month':
            start_date = today - timedelta(days=29)
            end_date = today
        else:
            return jsonify({'error': 'Invalid filter type'}), 400

        records = Attendance.query.filter(Attendance.date.between(start_date, end_date)).all()
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow(['Employee ID', 'Name', 'Department', 'Date', 'Status', 'Clock In', 'Clock Out'])
        
        # Write data
        for record in records:
            writer.writerow([
                record.employee_id,
                record.name,
                record.department,
                record.date.strftime('%d-%m-%Y'),
                record.status.capitalize(),
                record.clock_in or '--:--',
                record.clock_out or '--:--'
            ])
        
        # Prepare response
        output.seek(0)
        return Response(
            output,
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename=attendance_{filter_type}_{today.strftime("%Y-%m-%d")}.csv'
            }
        )
    except Exception as e:
        logger.error(f"Error exporting attendance: {e}")
        return jsonify({'error': str(e)}), 500

# API to get attendance statistics
@app.route('/api/attendance_stats', methods=['GET'])
@login_required
def get_attendance_stats():
    try:
        filter_type = request.args.get('filter', 'today')
        today = date(2025, 4, 30)  # Fixed date for consistency
        
        # Define date range based on filter
        if filter_type == 'today':
            start_date = today
            end_date = today
        elif filter_type == 'week':
            start_date = today - timedelta(days=6)
            end_date = today
        elif filter_type == 'month':
            start_date = today - timedelta(days=29)
            end_date = today
        else:
            return jsonify({'error': 'Invalid filter type'}), 400

        total = Attendance.query.filter(Attendance.date.between(start_date, end_date)).count()
        present = Attendance.query.filter(
            Attendance.date.between(start_date, end_date),
            Attendance.status == 'present'
        ).count()
        late = Attendance.query.filter(
            Attendance.date.between(start_date, end_date),
            Attendance.status == 'late'
        ).count()
        leave = Attendance.query.filter(
            Attendance.date.between(start_date, end_date),
            Attendance.status == 'leave'
        ).count()
        remote = Attendance.query.filter(
            Attendance.date.between(start_date, end_date),
            Attendance.status == 'remote'
        ).count()
        total_employees = Employee.query.count()

        return jsonify({
            'present': {
                'count': present,
                'total': total,
                'percentage': round(present / total * 100, 1) if total else 0
            },
            'late': {
                'count': late,
                'percentage': round(late / total * 100, 1) if total else 0
            },
            'leave': {
                'count': leave,
                'percentage': round(leave / total * 100, 1) if total else 0
            },
            'remote': {
                'count': remote,
                'percentage': round(remote / total * 100, 1) if total else 0
            },
            'total_employees': total_employees
        })
    except Exception as e:
        logger.error(f"Error fetching attendance stats: {e}")
        return jsonify({'error': str(e)}), 500

# API to get leave requests
@app.route('/api/leave_requests', methods=['GET'])
@login_required
def get_leave_requests():
    try:
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))

        query = LeaveRequest.query
        
        if search:
            query = query.filter(
                (LeaveRequest.employee_name.ilike(f'%{search}%')) |
                (LeaveRequest.request_id.ilike(f'%{search}%')) |
                (LeaveRequest.department.ilike(f'%{search}%'))
            )
        if status and status != 'all':
            query = query.filter(LeaveRequest.status == status)

        total = query.count()
        leaves = query.order_by(LeaveRequest.created_at.desc()).offset((page-1)*per_page).limit(per_page).all()

        return jsonify({
            'requests': [{
                'id': leave.id,
                'request_id': leave.request_id,
                'employee': {
                    'name': leave.employee_name,
                    'department': leave.department,
                    'image': leave.employee_image
                },
                'leave_type': leave.leave_type,
                'from': leave.start_date.strftime('%d-%m-%Y'),
                'to': leave.end_date.strftime('%d-%m-%Y'),
                'days': leave.days,
                'status': leave.status
            } for leave in leaves],
            'total': total,
            'page': page,
            'per_page': per_page
        })
    except Exception as e:
        logger.error(f"Error fetching leave requests: {e}")
        return jsonify({'error': str(e)}), 500

# API to create a leave request
@app.route('/api/leave_requests', methods=['POST'])
@login_required
def create_leave_request():
    try:
        data = request.get_json()
        employee_name = data.get('employee_name')
        department = data.get('department')
        leave_type = data.get('leave_type')
        start_date = datetime.strptime(data.get('start_date'), '%Y-%m-%d').date()
        end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date()
        employee_image = data.get('employee_image', '')

        if not all([employee_name, department, leave_type, start_date, end_date]):
            return jsonify({'error': 'Missing required fields'}), 400

        if start_date > end_date:
            return jsonify({'error': 'Start date must be before end date'}), 400

        days = (end_date - start_date).days + 1
        request_id = f'LR{str(LeaveRequest.query.count() + 1).zfill(3)}'

        new_leave = LeaveRequest(
            request_id=request_id,
            employee_name=employee_name,
            department=department,
            employee_image=employee_image,
            leave_type=leave_type,
            start_date=start_date,
            end_date=end_date,
            days=days,
            status='pending'
        )
        db.session.add(new_leave)
        db.session.commit()
        return jsonify({'message': 'Leave request created successfully', 'request_id': request_id}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating leave request: {e}")
        return jsonify({'error': str(e)}), 500

# API to update leave request status
@app.route('/api/leave_requests/<int:id>', methods=['PUT'])
@login_required
def update_leave_request(id):
    try:
        leave = LeaveRequest.query.get_or_404(id)
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['pending', 'approved', 'rejected']:
            return jsonify({'error': 'Invalid status'}), 400
            
        leave.status = status
        db.session.commit()
        return jsonify({'message': 'Leave request updated successfully'})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating leave request: {e}")
        return jsonify({'error': str(e)}), 500

# API to get leave statistics
@app.route('/api/leave_stats', methods=['GET'])
@login_required
def get_leave_stats():
    try:
        total_leaves = 240  # 12 employees * 20 days per year
        current_year = 2025  # Fixed for consistency with seeding
        leaves_taken = LeaveRequest.query.filter(
            and_(
                LeaveRequest.status == 'approved',
                LeaveRequest.start_date >= date(current_year, 1, 1),
                LeaveRequest.end_date <= date(current_year, 12, 31)
            )
        ).with_entities(db.func.sum(LeaveRequest.days)).scalar() or 0
        pending_requests = LeaveRequest.query.filter_by(status='pending').count()
        remaining_leaves = max(0, total_leaves - leaves_taken)

        return jsonify({
            'total_leaves': total_leaves,
            'leaves_taken': leaves_taken,
            'pending_requests': pending_requests,
            'remaining_leaves': remaining_leaves
        })
    except Exception as e:
        logger.error(f"Error fetching leave stats: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)