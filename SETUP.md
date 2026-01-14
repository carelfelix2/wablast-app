# WABlast App - Installation & Setup Guide

## 📋 Prasyarat

- Node.js v18+ atau v20+ (dengan npm)
- Browser modern (Chrome, Firefox, Safari, Edge)
- Laragon atau web server lokal (sudah tersedia di `c:\laragon\www\wablast-app`)

## 🚀 Quick Start

### 1. Lokasi Project
```
c:\laragon\www\wablast-app
```

### 2. Environment Setup

Buat file `.env.local` di root project:

```bash
# For Production API
NEXT_PUBLIC_API_URL=https://api.wablast.net

# OR For Local Development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Install Dependencies (sudah dilakukan)

Semua dependencies sudah terinstall:
- ✅ next@16.1.1
- ✅ react@19
- ✅ typescript
- ✅ tailwindcss (v4)
- ✅ zustand
- ✅ axios
- ✅ zod
- ✅ react-hook-form
- ✅ shadcn-ui (8 components)
- ✅ lucide-react
- ✅ qrcode.react
- ✅ js-cookie

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka browser di: **http://localhost:3000**

## 📖 User Flow

### 1. Login Page
- URL: `http://localhost:3000/login` (default jika belum auth)
- Masukkan email & password
- Tekan tombol "Sign In"
- Sistem akan mengirim POST ke `https://api.wablast.net/auth/login`
- Jika berhasil, redirect ke dashboard
- Token disimpan di cookies + localStorage

### 2. Dashboard
- URL: `http://localhost:3000/dashboard`
- Menampilkan statistik:
  - Total Instances
  - Connected Instances
  - Total Messages
  - Success Rate
- Grafik penggunaan pesan
- Status messages (Sent, Pending, Failed)

### 3. Instances Page
- URL: `http://localhost:3000/dashboard/instances`
- Fitur:
  - ✅ View semua instance
  - ✅ Create instance baru
  - ✅ Start session (generate QR code)
  - ✅ Restart instance
  - ✅ Delete instance
  - ✅ Status indicator

### 4. Messages Page
- URL: `http://localhost:3000/dashboard/messages`
- Fitur:
  - ✅ Form kirim pesan
  - ✅ Select instance
  - ✅ Input nomor tujuan
  - ✅ Input isi pesan
  - ✅ Log tabel pesan
  - ✅ Filter berdasarkan instance

### 5. Settings Page
- URL: `http://localhost:3000/dashboard/settings`
- Fitur:
  - ✅ View profil user
  - ✅ View/hide API key
  - ✅ Generate API key baru
  - ✅ Copy API key ke clipboard
  - ✅ API documentation links

## 🔧 Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# ESLint check
npm run lint

# Open on Network (untuk IP publik)
# Server akan tersedia di: http://[YOUR_IP]:3000
```

## 🎨 Struktur File yang Dibuat

```
src/
├── app/
│   ├── login/
│   │   ├── page.tsx
│   │   └── form.tsx
│   ├── dashboard/
│   │   ├── layout.tsx (Protected layout)
│   │   ├── page.tsx (Main dashboard)
│   │   ├── instances/
│   │   │   ├── page.tsx
│   │   │   ├── CreateInstanceDialog.tsx
│   │   │   └── QRCodeModal.tsx
│   │   ├── messages/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── layout.tsx (Root layout)
│   ├── page.tsx (Redirect to login/dashboard)
│   └── globals.css (Tailwind + theme)
│
├── components/
│   ├── ui/ (shadcn-ui components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   └── dropdown-menu.tsx
│   ├── charts/
│   │   └── LineChart.tsx
│   ├── Sidebar.tsx (Navigation)
│   └── Navbar.tsx (User profile)
│
├── lib/
│   ├── api.ts (Axios instance + interceptors)
│   ├── auth.ts (Cookie/token management)
│   ├── useUserStore.ts (Zustand store)
│   ├── useToast.ts (Toast notifications)
│   ├── validations.ts (Zod schemas)
│   └── utils.ts (shadcn utilities)
│
└── services/
    ├── authService.ts
    ├── instanceService.ts
    ├── messageService.ts
    └── billingService.ts
```

## 🔐 API Integration

### Auth Endpoints
```
POST /auth/login
POST /auth/logout
GET /auth/me
```

### Instance Endpoints
```
GET /instance/list
POST /instance/create
POST /instance/{id}/session/start
GET /instance/{id}
DELETE /instance/{id}
POST /instance/{id}/restart
```

### Message Endpoints
```
POST /message/send
GET /message/list
GET /message/stats
```

### Billing Endpoints
```
GET /billing/info
GET /billing/usage
POST /billing/generate-api-key
```

## 🧪 Testing dengan Mock Data

Jika API tidak tersedia, sistem akan otomatis menggunakan mock data:
- Demo instances dengan status connected/disconnected
- Demo messages dengan berbagai status
- Demo statistics

Ini memungkinkan testing UI tanpa backend API.

## 🐛 Debugging

### Check Local Storage
```javascript
// Di browser console
localStorage.getItem('user-storage') // Lihat Zustand store
localStorage.getItem('wablast_token') // Lihat token
```

### Check Network Requests
- Buka Chrome DevTools (F12)
- Tab "Network"
- Lihat request ke API endpoint

### Reset Auth State
```javascript
// Di browser console
localStorage.removeItem('user-storage')
localStorage.removeItem('wablast_token')
// Reload halaman
```

## 📱 Responsive Design

- ✅ Mobile-friendly (< 768px)
- ✅ Tablet-friendly (768px - 1024px)
- ✅ Desktop (> 1024px)
- ✅ Sidebar collapsible di mobile
- ✅ Touch-friendly buttons

## 🎯 Customization

### Ubah Warna Primary
Edit `src/app/globals.css` atau ubah class:
- `bg-green-600` → `bg-blue-600` (atau warna lain)
- `text-green-500` → `text-blue-500`

### Ubah API URL
Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

### Tambah Menu Baru
Edit `src/components/Sidebar.tsx`:
```typescript
const menuItems = [
  // Tambah item baru di sini
  { href: '/dashboard/new-page', label: 'New Page', icon: IconName },
];
```

## 🚀 Deployment

### Deploy ke Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy ke Server Biasa
```bash
npm run build
npm start
```

Server akan berjalan di port 3000 secara default.

## 📞 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 sudah digunakan | `npm run dev -- -p 3001` |
| API connection error | Check `.env.local` dan pastikan backend running |
| Build error | `rm -r .next && npm run build` |
| Token tidak tersimpan | Check browser cookie & localStorage settings |
| Sidebar tidak muncul | Clear browser cache (Ctrl+Shift+Del) |

## 📖 Dokumentasi Tambahan

- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn-ui: https://ui.shadcn.com
- Zustand: https://github.com/pmndrs/zustand
- Zod: https://zod.dev

## ✅ Checklist

Pastikan semua sudah terpenuhi:
- [x] Project dibuat di `c:\laragon\www\wablast-app`
- [x] Semua dependencies terinstall
- [x] shadcn-ui components sudah ditambah
- [x] Environment variables dikonfigurasi
- [x] Dev server running di port 3000
- [x] Login page berfungsi
- [x] Dashboard page berfungsi
- [x] Protected routes bekerja
- [x] Mock data tersedia untuk testing

## 🎉 Ready to Go!

Project WABlast sekarang siap digunakan! Akses di:

**http://localhost:3000**

Nikmati! 🚀
