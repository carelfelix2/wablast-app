# WABlast - WhatsApp Business API Dashboard

Dashboard lengkap untuk mengelola instance WhatsApp Business dan mengirim pesan melalui Evolution API.

## 🚀 Teknologi yang Digunakan

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui
- **Icons**: lucide-react
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Form Management**: React Hook Form + Zod
- **QR Code**: qrcode.react
- **Cookie Management**: js-cookie

## 📁 Struktur Project

```
wablast-app/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── form.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── instances/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── CreateInstanceDialog.tsx
│   │   │   │   └── QRCodeModal.tsx
│   │   │   ├── messages/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/ (shadcn-ui components)
│   │   ├── charts/
│   │   │   └── LineChart.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navbar.tsx
│   ├── lib/
│   │   ├── api.ts (Axios wrapper dengan token)
│   │   ├── auth.ts (Auth utilities)
│   │   ├── useUserStore.ts (Zustand store)
│   │   ├── useToast.ts (Toast notifications)
│   │   ├── validations.ts (Zod schemas)
│   │   └── utils.ts (shadcn utilities)
│   └── services/
│       ├── authService.ts
│       ├── instanceService.ts
│       ├── messageService.ts
│       └── billingService.ts
├── public/
│   └── images/
├── .env.example
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## 🔑 Fitur Utama

### 1. **Authentication**
- Login dengan email dan password
- Token management dengan Zustand
- Token disimpan di cookies dan localStorage
- Auto-redirect ke login jika token expired

### 2. **Dashboard**
- Ringkasan statistik (total instance, pesan, dll)
- Chart penggunaan pesan
- Status real-time dari instance

### 3. **Instances Management**
- Lihat daftar semua instance
- Buat instance baru
- QR Code modal untuk koneksi
- Start/restart instance
- Delete instance
- Status indikator (connected, disconnected, connecting)

### 4. **Messages**
- Form untuk mengirim pesan
- Select instance dan nomor tujuan
- Kirim pesan dengan validasi
- Tabel log pesan terkirim
- Filter berdasarkan instance
- Status tracking (sent, pending, failed)

### 5. **Settings**
- Lihat informasi akun
- Generate & manage API Key
- Copy API key ke clipboard
- Dokumentasi API

### 6. **Global Components**
- **Sidebar**: Navigasi mobile-responsive
- **Navbar**: User profile dropdown
- **Toast**: Notifications system
- **Dashboard Layout**: Protected layout dengan auth check

## 🛠️ Instalasi

### 1. Lokasi Project

```bash
c:\laragon\www\wablast-app
```

### 2. Buat file .env.local

```bash
# Copy dari .env.example
copy .env.example .env.local
```

Edit `c:\laragon\www\wablast-app\.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.wablast.net
```

Untuk development lokal:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Install dependencies (sudah dilakukan)

Semua dependencies sudah terinstall, termasuk:
- next, react, react-dom
- tailwindcss, @tailwindcss/postcss
- zustand, axios, zod
- qrcode.react, js-cookie
- react-hook-form, @hookform/resolvers
- shadcn-ui components

### 4. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📊 API Endpoints yang Digunakan

### Auth
- `POST /auth/login` - Login dengan email & password
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Instance
- `GET /instance/list` - Dapatkan daftar instance
- `POST /instance/create` - Buat instance baru
- `POST /instance/{id}/session/start` - Mulai session (generate QR code)
- `GET /instance/{id}` - Get instance detail
- `DELETE /instance/{id}` - Hapus instance
- `POST /instance/{id}/restart` - Restart instance

### Messages
- `POST /message/send` - Kirim pesan
- `GET /message/list` - Dapatkan daftar pesan
- `GET /message/stats` - Dapatkan statistik pesan

### Billing
- `GET /billing/info` - Info billing
- `GET /billing/usage` - Usage metrics
- `POST /billing/generate-api-key` - Generate API key

## 🎨 Tema & Styling

- **Primary Color**: Green (#00C853) - untuk button dan accent
- **Background**: Light gray/neutral
- **Text**: Dark slate

Gunakan Tailwind CSS classes untuk custom styling. Warna dapat diubah di dalam `src/app/globals.css`.

## 🧪 Validasi Form

Semua form menggunakan Zod untuk validasi:

- **Login**: Email format + password minimal 6 karakter
- **Create Instance**: Nama 2-50 karakter
- **Send Message**: Phone number format + message 1-4096 karakter

## 🔔 Toast Notifications

Sistem notifikasi otomatis untuk feedback:

```typescript
import { useToast } from '@/lib/useToast';

const { success, error, info } = useToast();

success('Pesan terkirim!');
error('Gagal mengirim pesan');
info('Loading data...');
```

## 🔐 Security

- JWT token management
- Axios interceptor untuk auto-attach token
- Auto-logout jika token expired (401)
- Protected routes di dashboard layout
- Secure cookie handling

## 📱 Responsive Design

- Mobile-first approach
- Sidebar collapsible di mobile
- Responsive grid layouts
- Touch-friendly buttons dan inputs

## 🚀 Production Build

```bash
npm run build
npm start
```

## 🐛 Development Tips

1. **Mock Data**: Semua service sudah siap dengan mock data jika API tidak tersedia
2. **Hot Reload**: Next.js akan auto-reload saat ada perubahan file
3. **Type Safety**: TypeScript akan menangkap error saat development
4. **ESLint**: Gunakan `npm run lint` untuk check code quality

## 📝 Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=https://api.wablast.net

# Optional (untuk development)
NODE_ENV=development
```

## 🤝 Mengubah Warna Brand

Edit file `src/app/globals.css` untuk mengubah warna primary atau buka halaman komponen Sidebar dan Navbar untuk ubah warna hijau (`bg-green-600`, `text-green-500`, dll) ke warna pilihan Anda.

## 🆘 Troubleshooting

### Port 3000 sudah digunakan

```bash
# Gunakan port lain
npm run dev -- -p 3001
```

### API connection error

Pastikan:
1. URL API benar di `.env.local`
2. Backend API sudah running
3. Check browser console untuk error details

### Build error

```bash
# Clear cache dan rebuild
rm -r .next
npm run build
```

## 📄 License

MIT License

---

**Built with ❤️ by WABlast Team**


This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
