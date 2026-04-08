# Admin Dashboard Login Guide

## How to Login to the Admin Dashboard

### Step 1: Start the Backend Server

First, make sure the backend server is running:

```bash
cd backend
npm run dev
```

The backend should be running on `http://localhost:5000`

### Step 2: Create an Admin User

You need to create an admin user first. There are two ways:

#### Option A: Using the Script (Recommended)

1. Install `tsx` if not already installed:
```bash
cd backend
npm install -D tsx
```

2. Run the create-admin script:
```bash
# Default admin (admin@iyawe.com / admin123)
npx tsx scripts/create-admin.ts

# Or with custom credentials:
npx tsx scripts/create-admin.ts your-email@example.com your-password "Your Name"
```

#### Option B: Manual Database Update

If you already have a user account, you can update it directly in MongoDB:

1. Connect to your MongoDB database
2. Find the user document in the `users` collection
3. Update the `role` field to `"ADMIN"`:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "ADMIN" } }
)
```

### Step 3: Start the Admin Dashboard

```bash
cd admin-dashboard
npm run dev
```

The admin dashboard will be available at `http://localhost:3001`

### Step 4: Login

1. Open `http://localhost:3001` in your browser
2. You'll be redirected to the login page (`/login`)
3. Enter your admin credentials:
   - **Email**: The email you used when creating the admin user
   - **Password**: The password you set
4. Click "Login"

### Default Admin Credentials (if using script defaults)

- **Email**: `admin@iyawe.com`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

### Troubleshooting

#### "Access denied. Admin privileges required."

This means the user account doesn't have the `ADMIN` role. Make sure:
- The user was created with `role: 'ADMIN'`
- The database was updated correctly

#### "Invalid email or password"

- Check that the backend server is running
- Verify the email and password are correct
- Make sure the user exists in the database

#### "Failed to fetch" or Network Error

- Ensure the backend is running on `http://localhost:5000`
- Check the `.env.local` file in `admin-dashboard` has `NEXT_PUBLIC_API_URL=http://localhost:5000`
- Check browser console for CORS errors

### Security Notes

- Admin accounts have full access to the system
- Use strong passwords for admin accounts
- Never commit admin credentials to version control
- Consider implementing additional security measures (2FA, IP whitelisting, etc.)
