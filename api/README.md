# Tong Studio Booking API

PHP API and database schema for the Tong Studio booking form.

## Database

1. Create a MySQL/MariaDB database (e.g. `tong_studio_booking`).
2. Run the schema:
   ```bash
   mysql -u your_user -p your_database < api/schema.sql
   ```
   If you already had the schema without the `admins` table, run:
   ```bash
   mysql -u your_user -p your_database < api/migrations/001_admins.sql
   ```

## API setup

1. Copy `config.sample.php` to `config.php`.
2. Set database credentials and allowed origins in `config.php`.
3. Ensure `config.php` is not committed (add `api/config.php` to `.gitignore`).

### Running locally (PHP built-in server)

Run the API so CORS preflight (OPTIONS) is handled. Either:

**Option A – from anywhere (recommended on Windows)**  
Double-click or run from a terminal:
```bash
run-api.bat
```

**Option B – from project root**  
```bash
cd E:\Projects\Tong-Studio-Booking-Form
php -S localhost:8000 router.php
```

The API is at `http://localhost:8000/api/submit-booking.php`. The frontend at `http://localhost:5173` is allowed by CORS (localhost origins are always allowed in dev).

## Endpoint: Submit booking

- **URL:** `POST /api/submit-booking.php` (or your server path)
- **Content-Type:** `application/json` or `application/x-www-form-urlencoded`

**Request body (JSON):**

```json
{
  "setup": "1",
  "date": "2025-03-15",
  "timing": "4h",
  "addons": ["lighting", "crew"],
  "extraRequests": "Need extra mics",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+91 98765 43210"
}
```

- `setup`: studio id — `"1"` | `"2"` | `"3"` | `"4"`
- `date`: `YYYY-MM-DD`, must be today or future
- `timing`: `"2h"` | `"4h"` | `"12h"` | `"24h"`
- `addons`: optional array of `"lighting"` | `"crew"` | `"teleprompter"` | `"backdrop"` | `"greenroom"`
- `extraRequests`: optional string
- `name`, `email`, `phone`: required

**Success (201):**

```json
{
  "success": true,
  "booking_id": 42,
  "message": "Booking received. We'll send a confirmation to your email shortly."
}
```

**Error (4xx/5xx):**

```json
{
  "success": false,
  "error": "Human-readable message"
}
```

## Frontend integration

In `BookingPage.tsx`, in `handleSubmit`, send the booking to the API before showing the confirmation:

```ts
const response = await fetch('https://yourdomain.com/api/submit-booking.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    setup: booking.setup,
    date: booking.date,
    timing: booking.timing,
    addons: booking.addons,
    extraRequests: booking.extraRequests,
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
  }),
});
const data = await response.json();
if (!data.success) throw new Error(data.error);
// then setSubmitted(true)
```

Handle errors (e.g. show `data.error`) and optionally retry or show "Book again".

---

## Admin API (login + bookings CRUD)

All admin requests must use **credentials: 'include'** (cookies) for session auth.

- **Default login:** username `admin`, password `password` — change after first login.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/login.php` | POST | Body: `{ "username", "password" }`. Sets session cookie. |
| `/api/admin/logout.php` | POST | Destroys session. |
| `/api/admin/me.php` | GET | Returns current user or 401. |
| `/api/admin/bookings.php` | GET | List all bookings. |
| `/api/admin/bookings.php?id=1` | GET | Get one booking. |
| `/api/admin/bookings.php?id=1` | PUT | Update booking (JSON body: any of status, customer_name, customer_email, customer_phone, booking_date, timing_slot, studio_id, extra_requests, addons). |
| `/api/admin/bookings.php?id=1` | DELETE | Delete booking. |

**Frontend:** Open `/login` to sign in, then `/admin` to view and manage bookings (edit, delete).
