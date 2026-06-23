# HRMS - Human Resource Management System

A comprehensive Human Resource Management System designed to solve digital transformation challenges in HR, including employee management, attendance tracking, payroll calculation, and internal workflow automation. 

The project is built with a modern, cross-platform architecture comprising a **Web Portal (Admin/HR)**, a **Mobile App (Employees)**, a **Backend Server**, and an **IoT Device (Attendance Machine)**.

---

## 🎯 Project Goals
The system provides a digital transformation solution for HR departments, offering:
- **Centralized Data Management:** Store and manage employee records, departments, and positions.
- **Automated Attendance:** Direct integration with physical attendance machines via MQTT protocol.
- **Digital Request Workflow:** Dynamic approval processes for employee requests (leave, late arrival, early departure, overtime, etc.).
- **Automated Payroll:** Manage insurance, tax, allowance policies, and automatically calculate monthly payroll.

---

## 💻 Tech Stack

The project utilizes a distributed, cross-platform model with industry-standard technologies:

### 1. Backend (API Server)
Located in the `/server` directory.
- **Language & Framework:** Node.js, Express.js, TypeScript.
- **Database & ORM:** Prisma ORM, PostgreSQL / MySQL.
- **Authentication & Security:** JWT, Bcrypt, Helmet, CORS.
- **Real-time & IoT:** Socket.io (real-time notifications), MQTT (attendance device communication).
- **Others:** Multer (file upload), Zod (data validation), Jest (Unit Testing), Node-cron (scheduled tasks).

### 2. Web Frontend (For Admin & HR)
Located in the `/hrms-web` directory.
- **Core:** React 19, TypeScript, Vite.
- **State Management:** Zustand, React Query (@tanstack/react-query).
- **UI & Styling:** Tailwind CSS v4, Ant Design, Lucide React.
- **Forms & Charts:** React Hook Form, Zod (Validation), Recharts.

### 3. Mobile App (For Employees)
Located in the `/hrms` directory.
- **Core:** Flutter (Dart).
- **State Management:** Riverpod.
- **Routing:** GoRouter.
- **Networking:** Dio (with Cookie Manager & Interceptors), Socket.io Client.
- **Data Parsing:** Freezed, Json Serializable.

### 4. IoT Device (Attendance Machine)
Located in the `/device` directory.
- **Platform:** C/C++ (Arduino IDE) for ESP32 / ESP8266 (or similar microcontrollers).
- **Protocol:** MQTT connection for real-time transmission of fingerprint/RFID data to the server.

---

## 🚀 Core Modules & Features

1. **Authentication & Authorization (Auth Module):**
   - Registration, login, and password recovery via OTP.
   - Access Token & Refresh Token management.
   - Role-Based Access Control (RBAC).

2. **Employee Management:**
   - Manage employee profiles and job histories (transfers, promotions).
   - Bulk import/export employee data via Excel files.

3. **Organizational Structure (Department & Position):**
   - Manage department hierarchy.
   - Define department managers and subordinate positions.

4. **Attendance & Scheduling:**
   - Configure work shifts and schedule assignments.
   - Record attendance logs. Two-way fingerprint synchronization between the server and the attendance machine via MQTT.
   - Automated timesheet generation.

5. **Request & Approval Workflow:**
   - Support various request types: Leave, Late/Early, Attendance Correction, Bonus/Penalty.
   - Multi-level approval workflow (Manager, HR) with real-time status notifications.

6. **Payroll & Policies:**
   - Manage annual leave balances and public holidays.
   - Configure insurance policies, tax brackets, allowances, and automatic penalty rules for late arrivals.
   - Automatically generate and calculate periodic payrolls.

---

## 📂 Folder Structure

```text
HRMS/
│
├── server/           # Backend API (Node.js, Express, Prisma, MQTT)
├── hrms-web/         # Web Portal for Admin & HR (React, Vite, Tailwind, AntD)
├── hrms/             # Mobile App for Employees (Flutter, Riverpod)
├── device/           # Embedded code for the attendance machine (Arduino/ESP)
├── API_DOCS.md       # Detailed API Specifications
└── ...               # Environment configs and other resources
```

---

## 🛠 Setup Instructions

### 1. Server (Backend)
```bash
cd server
npm install
# Configure environment variables in .env (DATABASE_URL, JWT_SECRET, MQTT_URI...)
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### 2. Web Frontend
```bash
cd hrms-web
npm install
# Configure environment variables in .env
npm run dev
```

### 3. Mobile App
```bash
cd hrms
flutter pub get
# Generate Freezed / Riverpod boilerplate code if needed
flutter pub run build_runner build --delete-conflicting-outputs
flutter run
```
