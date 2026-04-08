# IYAWE Admin Dashboard

Admin dashboard for managing lost and found documents in the IYAWE platform.

## Features

- **Admin Authentication**: Secure login for admin users only
- **Document Management**: View and manage all lost and found documents
- **Statistics Dashboard**: Overview of system statistics
- **User Management**: (Coming soon) Manage users and institutions

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

## Project Structure

```
admin-dashboard/
├── app/
│   ├── login/          # Admin login page
│   ├── dashboard/      # Main admin dashboard
│   └── layout.tsx      # Root layout
├── components/
│   └── ui/            # Reusable UI components
├── lib/
│   ├── api.ts         # API client configuration
│   └── utils.ts       # Utility functions
└── package.json
```

## Admin Access

To access the admin dashboard, you need an account with the `ADMIN` role. Contact the system administrator to create an admin account.

## API Endpoints

The admin dashboard connects to the backend API at the URL specified in `NEXT_PUBLIC_API_URL`.

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### Documents
- `GET /api/documents/latest` - Get latest documents
- `GET /api/admin/documents` - Get all documents (admin only)
- `GET /api/admin/reports/:type` - Get reports by type (admin only)

## Development

### Running in Development Mode

```bash
npm run dev
```

The admin dashboard will run on port 3001 by default (or the next available port).

### Building for Production

```bash
npm run build
npm start
```

## Notes

- The admin dashboard runs on a separate port from the main frontend
- Ensure the backend server is running before starting the admin dashboard
- Admin authentication is required for all dashboard pages
