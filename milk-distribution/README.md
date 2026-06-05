# 🥛 Milk Distribution Management System

A production-ready PWA for managing milk distribution operations.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + PWA |
| Backend | Java 21 + Spring Boot 3 |
| Database | MySQL |
| Auth | JWT |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |
| Deploy DB | Railway |

---

## Project Structure

```
milk-distribution/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/milkdist/
│   │   ├── config/             # Security, Swagger, DataInitializer
│   │   ├── controller/         # REST controllers
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA entities
│   │   ├── exception/          # Global exception handling
│   │   ├── repository/         # Spring Data JPA repos
│   │   ├── security/           # JWT filter, UserDetailsService
│   │   └── service/            # Business logic
│   ├── Dockerfile
│   └── pom.xml
└── frontend/                   # React PWA
    ├── src/
    │   ├── api/                # Axios + API calls
    │   ├── components/common/  # Layout, Modal, Spinner
    │   ├── context/            # Auth, Theme context
    │   ├── pages/
    │   │   ├── admin/          # Admin dashboard
    │   │   ├── distributor/    # Distributor pages
    │   │   └── delivery/       # Delivery boy pages
    │   └── styles/             # Global CSS
    └── vite.config.js
```

---

## Quick Start (Local Development)

### Prerequisites
- Java 21
- Maven 3.8+
- Node.js 18+
- MySQL 8.0

### 1. Database Setup

```sql
CREATE DATABASE milk_distribution;
```

### 2. Backend

```bash
cd backend

# Update src/main/resources/application.properties
# Set your MySQL credentials

mvn spring-boot:run
```

Backend runs at: http://localhost:8081
Swagger UI: http://localhost:8081/swagger-ui.html

Default admin: `admin` / `admin123`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/distributors | Add distributor |
| GET | /api/admin/distributors | List distributors |
| PATCH | /api/admin/distributors/{id}/status | Update status |
| PATCH | /api/admin/distributors/{id}/reset-password | Reset password |

### Distributor
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/distributor/dashboard | Dashboard stats |
| POST | /api/distributor/delivery-boys | Add delivery boy |
| GET | /api/distributor/delivery-boys | List delivery boys |
| POST | /api/distributor/customers | Add customer |
| GET | /api/distributor/customers | List/search customers |
| POST | /api/distributor/milk-prices | Update milk price |
| GET | /api/distributor/reports/daily-chart | Daily sales chart |
| GET | /api/distributor/reports/monthly-trend | Monthly trend |
| GET | /api/distributor/reports/delivery-boy-performance | Performance |

### Delivery
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/delivery | Save delivery entry |
| GET | /api/delivery/date/{date} | Get deliveries for date |
| GET | /api/delivery/my-customers | Get assigned customers |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/billing/generate | Generate monthly bills |
| GET | /api/billing | Get bills by month |
| POST | /api/billing/payment | Record payment |

---

## Deployment

### Database → Railway

1. Go to https://railway.app
2. New Project → MySQL
3. Copy connection string
4. Update backend env vars

### Backend → Render

1. Push backend to GitHub
2. Go to https://render.com → New Web Service
3. Connect GitHub repo
4. Set environment variables:
   ```
   DB_URL=jdbc:mysql://...
   DB_USERNAME=...
   DB_PASSWORD=...
   JWT_SECRET=your_64_char_secret
   CORS_ORIGINS=https://your-app.vercel.app
   ```
5. Build command: `mvn clean package -DskipTests`
6. Start command: `java -jar target/milk-distribution-1.0.0.jar`

### Frontend → Vercel

1. Push frontend to GitHub
2. Go to https://vercel.com → New Project
3. Import repo
4. Set environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
5. Deploy!

---

## User Roles & Credentials

| Role | Default Login | Access |
|------|--------------|--------|
| ADMIN | admin / admin123 | Manage distributors |
| DISTRIBUTOR | (created by admin) | Full distribution management |
| DELIVERY_BOY | (created by distributor) | Daily delivery entry |

---

## PWA Features

- ✅ Installable on mobile home screen
- ✅ Offline support (cached assets + API)
- ✅ Fullscreen mode
- ✅ Mobile-first responsive UI
- ✅ Bottom navigation on mobile
- ✅ Hamburger sidebar
- ✅ Dark/Light mode

---

## Database Schema

```
users           → id, username, password, role, active
distributors    → id, name, mobile, address, status, user_id
delivery_boys   → id, name, mobile, address, active, distributor_id, user_id
customers       → id, name, mobile, address, milk_type, default_quantity, pending_balance, distributor_id, delivery_boy_id
daily_deliveries → id, customer_id, distributor_id, delivery_boy_id, delivery_date, milk_type, quantity, price_per_liter, total_amount, delivery_status, notes
bills           → id, customer_id, distributor_id, bill_month, bill_year, current_month_amount, previous_pending, paid_amount, total_amount, remaining_amount, status
payments        → id, customer_id, distributor_id, bill_id, amount, payment_date, payment_mode, notes
milk_prices     → id, distributor_id, milk_type, price_per_liter, active
```

---

## Billing Formula

```
Total Bill = Current Month Amount + Previous Pending
Remaining  = Total Bill - Paid Amount
```

Supports partial payments with carry-forward balance.

---

## WhatsApp Integration

Bills include a pre-formatted WhatsApp message. Click "📱 WhatsApp" button to open WhatsApp with the bill message pre-filled for the customer's number.

Message format:
```
🥛 Milk Bill - MM/YYYY
Customer: [Name]
Delivery Boy: [Name]
Current Month: ₹XXX
Previous Pending: ₹XXX
Total: ₹XXX
Paid: ₹XXX
Remaining: ₹XXX
```
