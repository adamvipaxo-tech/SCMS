# Supply Chain Management System (SCMS)

**SupplyNet Ltd** — Musanze District, Northern Province, Rwanda  
National Practical Exam 2026

> **Rename this folder** to `YourFirstName_YourLastName_National_Practical_Exam_2026` before submission.

## Project Structure

```
FirstName_LastName_National_Practical_Exam_2026/
├── docs/ERD.md              # Entity Relationship Diagram
├── database/
│   ├── schema.sql           # SCMS MySQL database
│   └── seed.sql             # Sample data
├── backend-project/         # Node.js + Express API
└── frontend-project/        # React.js + Tailwind CSS
```

## Requirements Checklist

| Requirement | Status |
|-------------|--------|
| ERD with PK/FK and cardinalities | `docs/ERD.md` |
| MySQL database `SCMS` | `database/schema.sql` |
| Supplier: INSERT only | ✓ |
| Shipment & Delivery: CRUD (insert/update/delete/retrieve) | ✓ |
| User account (username/password) | ✓ JWT auth |
| Axios integration | ✓ |
| Daily/Weekly/Monthly reports | ✓ |
| Sidebar navigation (responsive) | ✓ |
| Tailwind CSS UI | ✓ |

## Setup Instructions

### 1. Database (MySQL)

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend

```bash
cd backend-project
cp .env.example .env
# Edit .env with your MySQL password
npm install
npm run dev
```

API runs at **http://localhost:5000**

### 3. Frontend

```bash
cd frontend-project
npm install
npm run dev
```

App runs at **http://localhost:5173**

Sign in with an admin account created via the API or Profile page.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/suppliers` | Add supplier (insert only) |
| GET | `/api/suppliers` | List suppliers |
| GET/POST/PUT/DELETE | `/api/shipments` | Shipment CRUD |
| GET/POST/PUT/DELETE | `/api/deliveries` | Delivery CRUD |
| GET | `/api/reports/:entity/:period` | Reports (suppliers/shipments/deliveries × daily/weekly/monthly) |
| GET | `/api/users` | List admin accounts |
| POST | `/api/users` | Create admin account |
| PUT | `/api/users/change-password` | Change own password |
| DELETE | `/api/users/:id` | Delete admin (not yourself; at least one admin must remain) |

## ERD Summary

- **Supplier** (1) → (*) **Shipment** via `supplierCode`
- **Shipment** (1) → (*) **Delivery** via `shipmentNumber`

Draw the formal ERD on paper, then replicate in draw.io / Lucidchart using `docs/ERD.md` as reference.
