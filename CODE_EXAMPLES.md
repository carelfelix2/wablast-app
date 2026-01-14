# WABlast App - Code Examples

## 1️⃣ Authentication Flow

### Login Example
```typescript
// File: src/app/login/form.tsx
import { authService } from '@/services/authService';
import { useToast } from '@/lib/useToast';

const { success, error } = useToast();

try {
  const response = await authService.login({
    email: 'user@example.com',
    password: 'password123'
  });
  success(`Welcome back, ${response.user.name}!`);
  router.push('/dashboard');
} catch (err) {
  error('Login failed. Please check your credentials.');
}
```

### Token Management
```typescript
// File: src/lib/auth.ts
import { setAuthToken, getAuthToken } from '@/lib/auth';

// Save token
setAuthToken(token);

// Get token
const token = getAuthToken();

// Logout
removeAuthToken();
```

### API Interceptor
```typescript
// File: src/lib/api.ts
// Automatic token injection in all requests
api.interceptors.request.use((config) => {
  const { token } = useUserStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 2️⃣ State Management (Zustand)

### Store Definition
```typescript
// File: src/lib/useUserStore.ts
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user: User) => set({ user }),
      setToken: (token: string) => set({ token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
```

### Usage in Component
```typescript
import { useUserStore } from '@/lib/useUserStore';

function MyComponent() {
  const { user, setUser, logout } = useUserStore();
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 3️⃣ API Services

### Instance Service Example
```typescript
// File: src/services/instanceService.ts

// Get all instances
const instances = await instanceService.getInstances();

// Create new instance
const newInstance = await instanceService.createInstance({
  name: 'My Instance'
});

// Start session (get QR code)
const { qrCode } = await instanceService.startSession(instanceId);

// Delete instance
await instanceService.deleteInstance(instanceId);
```

### Message Service Example
```typescript
// File: src/services/messageService.ts

// Send message
const message = await messageService.sendMessage({
  instanceId: 'instance-1',
  to: '6287123456789',
  body: 'Hello World!'
});

// Get messages
const messages = await messageService.getMessages();

// Get stats
const stats = await messageService.getMessageStats();
console.log(`Sent: ${stats.sent}, Failed: ${stats.failed}`);
```

## 4️⃣ Form Validation (Zod)

### Define Schema
```typescript
// File: src/lib/validations.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});
```

### Use in Component
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
    </form>
  );
}
```

## 5️⃣ Toast Notifications

### Setup
```typescript
// File: src/app/dashboard/layout.tsx
import { useToast, ToastContainer } from '@/lib/useToast';

export default function DashboardLayout() {
  const { toasts, removeToast } = useToast();

  return (
    <div>
      {/* Your content */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
```

### Usage
```typescript
import { useToast } from '@/lib/useToast';

function MyComponent() {
  const { success, error, info } = useToast();

  const handleClick = async () => {
    try {
      // Do something
      success('Operation successful!');
    } catch (err) {
      error('Operation failed!');
    }
  };

  return <button onClick={handleClick}>Action</button>;
}
```

## 6️⃣ Protected Routes

### Dashboard Layout (Protected)
```typescript
// File: src/app/dashboard/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/useUserStore';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated()) {
    return null; // Loading state
  }

  return (
    <div>
      <Sidebar />
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
```

## 7️⃣ Data Fetching

### Dashboard Data Loading
```typescript
// File: src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { instanceService } from '@/services/instanceService';
import { messageService } from '@/services/messageService';
import { useToast } from '@/lib/useToast';

export default function DashboardPage() {
  const { info } = useToast();
  const [stats, setStats] = useState({...});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [instances, messageStats] = await Promise.all([
          instanceService.getInstances(),
          messageService.getMessageStats(),
        ]);
        setStats({ instances, messageStats });
      } catch (error) {
        info('Using demo data');
        // Set demo data
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return isLoading ? <div>Loading...</div> : <div>{/* content */}</div>;
}
```

## 8️⃣ Dialog Components

### Create Instance Dialog
```typescript
// File: src/app/dashboard/instances/CreateInstanceDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CreateInstanceDialog({
  open,
  onOpenChange,
  onCreate,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Instance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input placeholder="Instance name" {...register('name')} />
          <Button type="submit">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

## 9️⃣ Tables & Lists

### Instances Table
```typescript
// File: src/app/dashboard/instances/page.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {instances.map((instance) => (
      <TableRow key={instance.id}>
        <TableCell>{instance.name}</TableCell>
        <TableCell>
          <Badge className={instance.status === 'connected' ? 'bg-green-600' : 'bg-red-600'}>
            {instance.status}
          </Badge>
        </TableCell>
        <TableCell>
          <Button onClick={() => handleDelete(instance.id)}>Delete</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## 🔟 Custom Hooks

### Using useToast
```typescript
const { success, error, info } = useToast();

success('Message sent successfully!');
error('Failed to send message');
info('Processing your request...');
```

### Using useUserStore
```typescript
const { user, token, setUser, logout, isAuthenticated } = useUserStore();

// Check authentication
if (isAuthenticated()) {
  // User is logged in
}
```

## 1️⃣1️⃣ Environment Variables

### .env.local Example
```env
# Production
NEXT_PUBLIC_API_URL=https://api.wablast.net

# Local Development
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Access in Component
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## 1️⃣2️⃣ Styling Examples

### Using Tailwind Classes
```typescript
<div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-lg">
  <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
    Action
  </button>
</div>
```

### Responsive Grid
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 1 column on mobile, 2 on tablet, 4 on desktop */}
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</div>
```

---

**More examples available in the source code files!**
