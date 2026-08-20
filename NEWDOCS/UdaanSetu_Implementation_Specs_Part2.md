# UdaanSetu: Implementation Specifications & Developer Guide (Part 2)

**Version:** 2.0 | **Date:** August 19, 2026 | **Audience:** Development Team | **Status:** Production-Ready

---

## TABLE OF CONTENTS

1. Frontend Implementation Specs
2. Backend API Specifications
3. Database Schema & Migrations
4. Authentication & Security
5. Performance Optimization
6. Testing Strategy
7. Deployment & DevOps
8. Monitoring & Observability
9. Troubleshooting Guide
10. SIH Demo Preparation

---

## SECTION 1: FRONTEND IMPLEMENTATION SPECS

### 1.1 Technology Stack Justification

| Layer | Technology | Why Chosen | Alternative Considered |
|-------|-----------|-----------|------------------------|
| Framework | Next.js 14 | SSR + static generation, built-in routing, image optimization | React alone (too much setup) |
| Language | TypeScript | Type safety, better IDE support, catches errors early | JavaScript (error-prone) |
| Styling | Tailwind CSS + CSS Modules | Utility-first, consistent spacing, fast iteration | Styled-components (overkill) |
| State | React Context + Hooks | Simple state management, no extra dependencies | Redux (too complex for this project) |
| Charts | Recharts | React-native, responsive, good accessibility | Chart.js (canvas-based, harder to customize) |
| API Client | Axios + React Query | Automatic retries, caching, error handling | Fetch API (manual setup) |
| Testing | Vitest + React Testing Library | Fast, modern, good for component testing | Jest (slower) |

---

### 1.2 Project Structure (Detailed)

```
udaansetu-frontend/
│
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout (header, sidebar)
│   ├── page.tsx                 # Home page
│   ├── dashboard/
│   │   └── page.tsx             # Dashboard page
│   ├── research/
│   │   ├── page.tsx             # Research list
│   │   ├── create/page.tsx       # Create research
│   │   └── [id]/
│   │       ├── page.tsx         # View research
│   │       └── edit/page.tsx     # Edit research
│   ├── innovations/...           # Similar structure
│   ├── ipr/...                   # Similar structure
│   ├── startups/...              # Similar structure
│   ├── ecosystem/
│   │   ├── mentors/page.tsx
│   │   ├── schemes/page.tsx
│   │   └── incubators/page.tsx
│   ├── analytics/page.tsx        # Analytics dashboard
│   ├── settings/page.tsx         # Settings page
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── logout/page.tsx
│   └── not-found.tsx             # 404 page
│
├── components/
│   ├── Layout/
│   │   ├── Header.tsx            # Top navigation
│   │   ├── Sidebar.tsx           # Left sidebar
│   │   └── Footer.tsx            # Bottom footer
│   ├── ui/                        # Reusable components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Table.tsx
│   │   ├── Pagination.tsx
│   │   ├── Select.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── index.ts             # Barrel export
│   ├── Dashboard/
│   │   ├── StatsGrid.tsx         # Statistics cards
│   │   ├── PipelineFlow.tsx      # Pipeline visualization
│   │   ├── AtRiskTable.tsx       # At-risk projects
│   │   └── ActivityFeed.tsx      # Recent activity
│   ├── Research/
│   │   ├── ResearchForm.tsx      # Create/edit form
│   │   ├── ResearchCard.tsx      # List item
│   │   └── ResearchDetail.tsx    # Detail view
│   ├── Charts/
│   │   ├── BarChart.tsx
│   │   ├── PieChart.tsx
│   │   └── LineChart.tsx
│   └── Common/
│       ├── EmptyState.tsx        # "No results" state
│       ├── ErrorBoundary.tsx     # Error handling
│       └── Loading.tsx            # Global loading
│
├── hooks/
│   ├── useApi.ts                 # API calls with error handling
│   ├── useFocusTrap.ts           # Modal focus management
│   ├── useMediaQuery.ts          # Responsive queries
│   ├── useLocalStorage.ts        # Browser storage
│   ├── useAuth.ts                # Authentication state
│   ├── useNotifications.ts       # Toast notifications
│   └── useDebounce.ts            # Search debouncing
│
├── lib/
│   ├── api.ts                    # Axios instance & configuration
│   ├── constants.ts              # App constants (URLs, etc.)
│   ├── auth.ts                   # Auth utilities
│   ├── formatters.ts             # Date/time formatters
│   ├── validators.ts             # Form validation
│   └── utils.ts                  # General utilities
│
├── styles/
│   ├── globals.css               # Global styles
│   ├── tokens.css                # Design tokens (colors, spacing)
│   ├── responsive.css            # Media queries
│   └── animations.css            # Transitions & keyframes
│
├── types/
│   ├── index.ts                  # All TypeScript types
│   └── api.ts                    # API response types
│
├── __tests__/
│   ├── components/
│   │   ├── Button.test.tsx
│   │   ├── Input.test.tsx
│   │   └── Modal.test.tsx
│   ├── hooks/
│   │   ├── useApi.test.ts
│   │   └── useAuth.test.ts
│   └── pages/
│       ├── dashboard.test.tsx
│       └── research.test.tsx
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── udaan-illustration.png
│   │   └── flags/
│   └── fonts/
│       └── inter-variable.woff2
│
├── .env.local                    # Environment variables (local)
├── .env.production               # Production env vars
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS config
├── tsconfig.json                 # TypeScript configuration
├── package.json
└── README.md
```

---

### 1.3 Component Implementation Examples

#### 1.3.1 Button Component (Complete)

```tsx
// components/ui/Button.tsx
import React from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      icon,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const finalDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={`
          ${styles.btn}
          ${styles[`btn--${variant}`]}
          ${styles[`btn--${size}`]}
          ${className}
        `}
        disabled={finalDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && <span className={styles.icon}>{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

```css
/* components/ui/Button.module.css */
.btn {
  font-family: var(--font-body);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  white-space: nowrap;
  position: relative;
}

.btn:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Variants */
.btn--primary {
  background-color: var(--green-600);
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--green-700);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn--secondary {
  background-color: var(--gray-200);
  color: var(--gray-900);
}

.btn--secondary:hover:not(:disabled) {
  background-color: var(--gray-300);
  transform: translateY(-2px);
}

.btn--danger {
  background-color: var(--red-600);
  color: white;
}

.btn--danger:hover:not(:disabled) {
  background-color: var(--red-700);
}

.btn--ghost {
  background-color: transparent;
  color: var(--green-600);
}

.btn--ghost:hover:not(:disabled) {
  background-color: var(--gray-100);
}

/* Sizes */
.btn--sm {
  padding: 8px 12px;
  height: 32px;
  font-size: 12px;
  min-width: 44px;
}

.btn--md {
  padding: 10px 16px;
  height: 40px;
  font-size: 14px;
  min-width: 44px;
}

.btn--lg {
  padding: 12px 20px;
  height: 48px;
  font-size: 16px;
  min-width: 44px;
}

/* Loading spinner */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Icon spacing */
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

#### 1.3.2 useApi Custom Hook

```ts
// hooks/useApi.ts
import { useCallback, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';

interface UseApiOptions {
  autoFetch?: boolean;
  retries?: number;
  retryDelay?: number;
}

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  statusCode?: number;
}

export function useApi<T = unknown>(
  url: string,
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const { autoFetch = true, retries = 3, retryDelay = 1000 } = options;

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    let lastError: AxiosError | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await axios.get<T>(url);
        setState({
          data: response.data,
          error: null,
          isLoading: false,
          statusCode: response.status,
        });
        return;
      } catch (err) {
        lastError = err as AxiosError;

        if (attempt < retries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          );
        }
      }
    }

    // All retries exhausted
    const errorMessage =
      lastError?.response?.data?.message ||
      lastError?.message ||
      'Failed to fetch data';

    setState({
      data: null,
      error: errorMessage,
      isLoading: false,
      statusCode: lastError?.response?.status,
    });
  }, [url, retries, retryDelay]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return { ...state, refetch: fetchData };
}
```

#### 1.3.3 Modal Component with Focus Trap

```tsx
// components/ui/Modal.tsx
import React, { useEffect, useRef } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    { isOpen, onClose, title, children, footer, size = 'md' },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    useEffect(() => {
      if (!isOpen) return;

      // Close on Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className={styles.backdrop}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          className={`${styles.modal} ${styles[`modal--${size}`]}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          ref={modalRef}
        >
          {/* Header */}
          <div className={styles.header}>
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className={styles.content}>{children}</div>

          {/* Footer */}
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </>
    );
  }
);

Modal.displayName = 'Modal';
```

```css
/* components/ui/Modal.module.css */
.backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    transform: translate(-50%, -40%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}

.modal--sm {
  width: 90%;
  max-width: 400px;
}

.modal--md {
  width: 90%;
  max-width: 600px;
}

.modal--lg {
  width: 90%;
  max-width: 800px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--gray-200);
}

.title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.closeBtn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
}

.closeBtn:hover {
  background-color: var(--gray-100);
}

.closeBtn:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

.content {
  padding: var(--spacing-6);
  overflow-y: auto;
  flex: 1;
}

.footer {
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
  padding: var(--spacing-6);
  border-top: 1px solid var(--gray-200);
  background-color: var(--gray-50);
}

/* Mobile */
@media (max-width: 768px) {
  .modal {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    transform: translateY(0);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    max-height: 90vh;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .modal--sm,
  .modal--md,
  .modal--lg {
    width: 100%;
    max-width: 100%;
  }
}
```

---

### 1.4 State Management (React Context)

```tsx
// lib/contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'researcher' | 'mentor' | 'investor' | 'incubator';
  district: string;
  organization: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: Record<string, unknown>) => Promise<void>;
} | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
        isLoading: false,
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return initialState;
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token with backend
      axios
        .get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: res.data, token },
          });
        })
        .catch(() => {
          dispatch({ type: 'LOGOUT' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('authToken', res.data.token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: res.data.user, token: res.data.token },
      });
    } catch (err: any) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: err.response?.data?.message || 'Login failed',
      });
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (data: Record<string, unknown>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await axios.post('/auth/register', data);
      localStorage.setItem('authToken', res.data.token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: res.data.user, token: res.data.token },
      });
    } catch (err: any) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: err.response?.data?.message || 'Registration failed',
      });
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

### 1.5 Form Handling Example

```tsx
// components/Research/ResearchForm.tsx
import React, { useState } from 'react';
import { Button, Input, Select, Textarea, Form } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { validateEmail, validateRequired } from '@/lib/validators';

interface FormData {
  title: string;
  description: string;
  sector: string;
  status: string;
}

interface FormErrors {
  [key: string]: string;
}

export const ResearchForm: React.FC<{
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    sector: '',
    status: 'Draft',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(
    new Set()
  );

  const { data: sectors } = useApi('/api/sectors');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateRequired(formData.title)) {
      newErrors.title = 'Title is required';
    }

    if (!validateRequired(formData.description)) {
      newErrors.description = 'Description is required';
    }

    if (!validateRequired(formData.sector)) {
      newErrors.sector = 'Sector is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouchedFields((prev) => new Set([...prev, name]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Success handled by parent component (toast notification)
    } catch (err) {
      // Error handled by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <Input
          type="text"
          label="Research Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touchedFields.has('title') ? errors.title : undefined}
          required
          placeholder="e.g., AI-based Crop Yield Prediction"
        />
      </div>

      <div className="form-group">
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touchedFields.has('description') ? errors.description : undefined}
          required
          placeholder="Describe your research in detail..."
          maxLength={2000}
          showCounter
        />
      </div>

      <div className="form-group">
        <Select
          label="Sector"
          name="sector"
          value={formData.sector}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touchedFields.has('sector') ? errors.sector : undefined}
          required
          options={sectors?.map((s) => ({ value: s.id, label: s.name }))}
          placeholder="Select sector..."
        />
      </div>

      <div className="form-actions">
        <Button variant="secondary" type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isLoading}>
          Create Research Project
        </Button>
      </div>
    </form>
  );
};
```

---

## SECTION 2: BACKEND API SPECIFICATIONS

### 2.1 API Architecture

**Base URL:** `https://api.udaansetu.in` (production)

**API Version:** `v1`

**Authentication:** JWT Bearer token in `Authorization` header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2.2 Response Format (Standardized)

**Success Response (200-299)**
```json
{
  "status": "success",
  "data": {
    "id": "proj_abc123",
    "title": "AI Crop Prediction",
    "stage": "active"
  },
  "meta": {
    "timestamp": "2026-08-19T10:30:00Z",
    "version": "v1"
  }
}
```

**Paginated Response**
```json
{
  "status": "success",
  "data": [
    { "id": "1", "title": "Project 1" },
    { "id": "2", "title": "Project 2" }
  ],
  "pagination": {
    "total": 127,
    "page": 1,
    "pageSize": 20,
    "totalPages": 7
  }
}
```

**Error Response (400-599)**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is already registered",
    "details": [
      {
        "field": "email",
        "message": "Must be unique"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-08-19T10:30:00Z",
    "requestId": "req_xyz789"
  }
}
```

---

### 2.3 Authentication Endpoints

```
POST   /auth/register           Register new account
POST   /auth/login              Login with email/password
POST   /auth/logout             Logout (blacklist token)
POST   /auth/refresh            Refresh JWT token
GET    /auth/me                 Get current user profile
PATCH  /auth/me                 Update profile
POST   /auth/change-password    Change password
POST   /auth/verify-email       Verify email (OTP)
```

**Example: Register**
```
POST /auth/register
Content-Type: application/json

{
  "name": "Dr. Priya Sharma",
  "email": "priya@research.org",
  "password": "SecurePass123!",
  "role": "researcher",
  "district": "Ahmedabad",
  "organization": "IISER Pune"
}

Response (201):
{
  "status": "success",
  "data": {
    "id": "user_abc123",
    "name": "Dr. Priya Sharma",
    "email": "priya@research.org",
    "token": "eyJhbGc..."
  }
}
```

---

### 2.4 Records API Endpoints

#### 2.4.1 Research Projects

```
GET    /records?kind=research           List all research
POST   /records/research                Create research
GET    /records/{id}                    Get single research
PATCH  /records/{id}                    Update research
DELETE /records/{id}                    Delete research
POST   /records/{id}/milestones         Add milestone
GET    /records/{id}/milestones         Get milestones
PATCH  /records/{id}/milestones/{mid}   Update milestone
```

**Example: Create Research**
```
POST /records/research
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "AI-based Crop Yield Prediction",
  "description": "Using ML to predict crop yields...",
  "sector": "agriculture",
  "district": "Ahmedabad",
  "trl": 3,
  "keywordsJson": ["AI", "ML", "Agriculture"]
}

Response (201):
{
  "status": "success",
  "data": {
    "id": "research_abc123",
    "title": "AI-based Crop Yield Prediction",
    "stage": "draft",
    "progress": 0,
    "createdAt": "2026-08-19T10:30:00Z"
  }
}
```

#### 2.4.2 Innovations

```
GET    /records?kind=innovation        List innovations
POST   /records/innovation             Create innovation
GET    /records/{id}                   Get innovation
PATCH  /records/{id}                   Update innovation
```

#### 2.4.3 IPR / Patents

```
GET    /records?kind=ipr               List IPRs
POST   /records/ipr                    Create IPR filing
GET    /records/{id}                   Get IPR
PATCH  /records/{id}                   Update IPR
```

#### 2.4.4 Startups

```
GET    /records?kind=startup           List startups
POST   /records/startup                Create startup
GET    /records/{id}                   Get startup
PATCH  /records/{id}                   Update startup
```

---

### 2.5 AI/ML Endpoints

```
GET    /ai/recommendations/{id}        Get recommendations
GET    /ai/similar/{id}                Find similar records
POST   /ai/detect-duplicates           Find duplicate records
GET    /ai/risk/{id}                   Get risk prediction
GET    /ai/metrics                     ML model metrics
POST   /ml/train                       Retrain model (admin only)
GET    /ml/versions                    Model versions
```

**Example: Risk Prediction**
```
GET /ai/risk/research_abc123
Authorization: Bearer {token}

Response (200):
{
  "status": "success",
  "data": {
    "recordId": "research_abc123",
    "riskScore": 72,
    "riskLevel": "high",
    "confidence": 0.85,
    "reasons": [
      "2 months behind schedule",
      "Missing milestone completions",
      "No recent activity"
    ],
    "predictedCompletion": "2027-02-15"
  }
}
```

---

### 2.6 Government API Integration

```
POST   /government/aadhaar/verify           Verify Aadhaar
POST   /government/aadhaar/send-otp        Send OTP for Aadhaar
POST   /government/aadhaar/verify-otp      Verify Aadhaar OTP
POST   /government/digilocker/verify       Verify DigiLocker docs
POST   /government/startup-india/verify    Verify Startup India registration
GET    /government/startup-india/benefits  Get benefits for startup
POST   /government/ip-india/verify         Check IP India status
GET    /government/ip-india/search         Search patents
GET    /government/ondc/products           Search ONDC products
POST   /government/ondc/verify             Verify ONDC seller
```

**Example: Startup India Verification**
```
POST /government/startup-india/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "registrationNumber": "DPIIT123456",
  "din": "12345678"
}

Response (200):
{
  "status": "success",
  "data": {
    "isRegistered": true,
    "registrationDate": "2025-06-15",
    "benefits": [
      "Income tax exemption (3 years)",
      "GST exemption",
      "Patent fee exemption"
    ],
    "details": {
      "name": "TechStartup India",
      "sector": "IT",
      "stage": "seed"
    }
  }
}
```

---

### 2.7 Analytics Endpoints

```
GET    /analytics/overview              Overview statistics
GET    /analytics/by-sector             Records by sector
GET    /analytics/by-district           Records by district
GET    /analytics/pipeline              Pipeline progress
GET    /analytics/growth                Growth over time
GET    /analytics/impact                Impact metrics
```

**Example: Overview**
```
GET /analytics/overview
Authorization: Bearer {token}

Response (200):
{
  "status": "success",
  "data": {
    "totalRecords": 127,
    "recordsByType": {
      "research": 45,
      "innovation": 32,
      "ipr": 28,
      "startup": 22
    },
    "atRiskCount": 5,
    "jobsCreated": 1240,
    "usersReached": 54000,
    "revenue": 2500000
  }
}
```

---

## SECTION 3: DATABASE SCHEMA & MIGRATIONS

### 3.1 Core Tables

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'researcher', 'mentor', 'investor', 'incubator')),
  district VARCHAR(255),
  organization VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Records table (polymorphic)
CREATE TABLE records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind VARCHAR(50) NOT NULL CHECK (kind IN ('research', 'innovation', 'ipr', 'startup', 'mentor', 'scheme', 'incubator')),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  stage VARCHAR(100) NOT NULL,
  sector VARCHAR(100),
  district VARCHAR(255),
  trl INTEGER CHECK (trl >= 1 AND trl <= 9),
  status VARCHAR(50),
  created_by_id UUID NOT NULL REFERENCES users(id),
  parent_id UUID REFERENCES records(id),
  keywords_json JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_records_kind ON records(kind);
CREATE INDEX idx_records_stage ON records(stage);
CREATE INDEX idx_records_created_by ON records(created_by_id);
CREATE INDEX idx_records_parent ON records(parent_id);
CREATE INDEX idx_records_keywords ON records USING gin(keywords_json);

-- Milestones table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  completed_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_milestones_record_id ON milestones(record_id);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'VIEW')),
  entity_kind VARCHAR(50) NOT NULL,
  entity_id UUID,
  detail JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_kind, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Token blacklist (for logout)
CREATE TABLE token_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- ML predictions cache
CREATE TABLE ml_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES records(id),
  prediction_type VARCHAR(50) NOT NULL CHECK (prediction_type IN ('risk', 'success', 'similarity')),
  prediction_data JSONB NOT NULL,
  confidence DECIMAL(3,2),
  model_version VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ml_predictions_record ON ml_predictions(record_id);
CREATE INDEX idx_ml_predictions_type ON ml_predictions(prediction_type);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  kind VARCHAR(50) NOT NULL CHECK (kind IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

---

### 3.2 Database Optimization

**Connection Pooling**
```python
# backend/config.py
from sqlalchemy.pool import QueuePool

DATABASE_URL = "postgresql://user:password@localhost/udaansetu"

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,              # Max 20 connections
    max_overflow=10,           # Allow 10 overflow connections
    pool_pre_ping=True,        # Test connections before use
    pool_recycle=3600,         # Recycle connections every hour
)
```

**Query Optimization**
```python
# Use eager loading to avoid N+1 queries
records = session.query(Record)\
    .options(
        joinedload(Record.milestones),
        joinedload(Record.created_by)
    )\
    .filter(Record.kind == 'research')\
    .limit(20)\
    .all()

# Use pagination
records = session.query(Record)\
    .filter(Record.kind == 'research')\
    .offset((page - 1) * page_size)\
    .limit(page_size)\
    .all()
```

---

## SECTION 4: AUTHENTICATION & SECURITY

### 4.1 JWT Token Management

```python
# backend/auth/jwt_handler.py
import jwt
from datetime import datetime, timedelta
from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRY_HOURS

def create_token(user_id: str, role: str) -> str:
    """Create JWT token"""
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
        'iat': datetime.utcnow(),
        'type': 'access'
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Check if token is blacklisted
        if is_token_blacklisted(token):
            raise jwt.InvalidTokenError("Token has been revoked")
        
        return payload
    except jwt.ExpiredSignatureError:
        raise jwt.InvalidTokenError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise jwt.InvalidTokenError(f"Invalid token: {str(e)}")

def revoke_token(token: str, expires_at: datetime):
    """Add token to blacklist"""
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    TokenBlacklist.create(token_hash=token_hash, expires_at=expires_at)
```

### 4.2 Password Hashing

```python
# backend/auth/password.py
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

ph = PasswordHasher()

def hash_password(password: str) -> str:
    """Hash password using Argon2"""
    return ph.hash(password)

def verify_password(password: str, hash: str) -> bool:
    """Verify password"""
    try:
        ph.verify(hash, password)
        return True
    except VerificationError:
        return False
```

### 4.3 RBAC Implementation

```python
# backend/auth/rbac.py
from enum import Enum
from functools import wraps
from fastapi import HTTPException, status

class Role(str, Enum):
    ADMIN = "admin"
    RESEARCHER = "researcher"
    MENTOR = "mentor"
    INVESTOR = "investor"
    INCUBATOR = "incubator"

def require_role(*roles: Role):
    """Decorator to check user role"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user = None, **kwargs):
            if current_user.role not in roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to access this resource"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# Usage
@app.delete("/admin/users/{user_id}")
@require_role(Role.ADMIN)
async def delete_user(user_id: str, current_user = Depends(get_current_user)):
    # Only admins can access
    pass
```

### 4.4 Security Headers

```python
# backend/main.py
from fastapi.middleware import cors
from starlette.middleware import trustedhost

app.add_middleware(
    cors.CORSMiddleware,
    allow_origins=["https://udaansetu.in", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    trustedhost.TrustedHostMiddleware,
    allowed_hosts=["udaansetu.in", "*.udaansetu.in"]
)

# Custom security headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    return response
```

---

## SECTION 5: PERFORMANCE OPTIMIZATION

### 5.1 Frontend Caching

```ts
// lib/api.ts
import axios from 'axios';
import setupCache from 'axios-cache-adapter';

const cache = setupCache({
  maxAge: 15 * 60 * 1000,  // 15 minutes
});

const client = axios.create({
  adapter: cache.adapter,
});

// Cache GET requests, but not mutations
export const apiClient = {
  get: (url: string) => client.get(url),
  post: (url: string, data: any) => axios.post(url, data),  // Not cached
  patch: (url: string, data: any) => axios.patch(url, data),  // Not cached
  delete: (url: string) => axios.delete(url),  // Not cached
};
```

### 5.2 Image Optimization

```tsx
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/images/research.jpg"
  alt="Research project"
  width={500}
  height={300}
  quality={80}
  priority={false}  // Lazy load by default
  placeholder="blur"  // Show blur while loading
/>
```

### 5.3 Code Splitting

```tsx
// pages/dashboard.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const AtRiskTable = dynamic(() => import('@/components/Dashboard/AtRiskTable'), {
  loading: () => <div>Loading...</div>,
  ssr: false,  // Don't render on server
});

export default function Dashboard() {
  return (
    <>
      <StatsGrid />
      <Suspense fallback={<Loading />}>
        <AtRiskTable />
      </Suspense>
    </>
  );
}
```

### 5.4 Backend Caching

```python
# backend/cache.py
from redis import Redis
import json

redis_client = Redis(host='localhost', port=6379, db=0)

def cache_get(key: str):
    """Get from cache"""
    data = redis_client.get(key)
    return json.loads(data) if data else None

def cache_set(key: str, value: any, ttl: int = 3600):
    """Set cache with TTL (time-to-live)"""
    redis_client.setex(key, ttl, json.dumps(value))

# Usage
@app.get("/analytics/overview")
async def get_overview(current_user = Depends(get_current_user)):
    cache_key = f"analytics:overview:{current_user.id}"
    
    # Check cache first
    cached = cache_get(cache_key)
    if cached:
        return cached
    
    # Compute if not cached
    data = compute_analytics_overview(current_user.id)
    cache_set(cache_key, data, ttl=300)  # Cache for 5 minutes
    
    return data
```

---

## SECTION 6: TESTING STRATEGY

### 6.1 Frontend Unit Tests

```tsx
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies correct variant class', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn--danger');
  });

  it('shows loading state', () => {
    render(<Button isLoading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### 6.2 Integration Tests

```tsx
// __tests__/pages/research.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResearchForm } from '@/components/Research/ResearchForm';
import * as api from '@/lib/api';

vi.mock('@/lib/api');

describe('Research Form Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn().mockResolvedValue({ id: 'research_123' });

    render(<ResearchForm onSubmit={mockSubmit} />);

    // Fill form
    await user.type(screen.getByLabelText('Research Title'), 'My Research');
    await user.type(screen.getByLabelText('Description'), 'Description...');
    await user.selectOption(screen.getByLabelText('Sector'), 'agriculture');

    // Submit
    await user.click(screen.getByRole('button', { name: /create/i }));

    // Verify
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'My Research',
        description: 'Description...',
        sector: 'agriculture',
        status: 'Draft',
      });
    });
  });

  it('shows validation errors on invalid data', async () => {
    const user = userEvent.setup();
    render(<ResearchForm onSubmit={vi.fn()} />);

    // Submit without filling form
    await user.click(screen.getByRole('button', { name: /create/i }));

    // Verify errors
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });
});
```

### 6.3 API Tests

```python
# tests/test_auth_api.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestAuthAPI:
    def test_register_success(self):
        response = client.post(
            "/auth/register",
            json={
                "name": "Test User",
                "email": "test@example.com",
                "password": "SecurePass123!",
                "role": "researcher",
                "district": "Ahmedabad",
                "organization": "Test Org"
            }
        )
        
        assert response.status_code == 201
        assert "token" in response.json()["data"]
        assert response.json()["data"]["email"] == "test@example.com"

    def test_register_duplicate_email(self):
        # Create first user
        client.post(
            "/auth/register",
            json={
                "name": "User 1",
                "email": "duplicate@example.com",
                "password": "Pass123!",
                "role": "researcher",
                "district": "Ahmedabad",
                "organization": "Org"
            }
        )
        
        # Try to create duplicate
        response = client.post(
            "/auth/register",
            json={
                "name": "User 2",
                "email": "duplicate@example.com",
                "password": "Pass123!",
                "role": "researcher",
                "district": "Ahmedabad",
                "organization": "Org"
            }
        )
        
        assert response.status_code == 400
        assert response.json()["error"]["code"] == "VALIDATION_ERROR"

    def test_login_success(self):
        # Register user first
        client.post(
            "/auth/register",
            json={
                "name": "Login Test",
                "email": "login@example.com",
                "password": "SecurePass123!",
                "role": "researcher",
                "district": "Ahmedabad",
                "organization": "Org"
            }
        )
        
        # Login
        response = client.post(
            "/auth/login",
            json={
                "email": "login@example.com",
                "password": "SecurePass123!"
            }
        )
        
        assert response.status_code == 200
        assert "token" in response.json()["data"]

    def test_login_invalid_password(self):
        # Register user
        client.post(
            "/auth/register",
            json={
                "name": "Test",
                "email": "test2@example.com",
                "password": "CorrectPass123!",
                "role": "researcher",
                "district": "Ahmedabad",
                "organization": "Org"
            }
        )
        
        # Try wrong password
        response = client.post(
            "/auth/login",
            json={
                "email": "test2@example.com",
                "password": "WrongPass123!"
            }
        )
        
        assert response.status_code == 401
        assert response.json()["error"]["code"] == "INVALID_CREDENTIALS"
```

---

## SECTION 7: DEPLOYMENT & DEVOPS

### 7.1 Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy built application
COPY --from=builder /app/.next ./.next

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

```dockerfile
# backend.Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Security: Run as non-root user
RUN useradd -m -u 1001 appuser
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 7.2 Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - NODE_ENV=development
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

  backend:
    build:
      context: ./backend
      dockerfile: backend.Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://udaan:password@postgres:5432/udaansetu
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev_secret_key_change_in_production
      - ENVIRONMENT=development
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=udaan
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=udaansetu
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U udaan"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### 7.3 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Build application
        run: npm run build

      - name: Deploy to AWS
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          npm run deploy:aws
```

---

## SECTION 8: MONITORING & OBSERVABILITY

### 8.1 Logging

```python
# backend/logging_config.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'logger': record.name,
            'module': record.module,
        }
        
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    handlers=[
        logging.StreamHandler(),  # Console
        logging.FileHandler('app.log'),  # File
    ],
    format='%(message)s',
)

# Use JSON formatter
for handler in logging.root.handlers:
    handler.setFormatter(JSONFormatter())

logger = logging.getLogger(__name__)
```

### 8.2 Metrics

```python
# backend/metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Request metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

# Database metrics
db_connections_active = Gauge(
    'db_connections_active',
    'Active database connections'
)

# ML model metrics
ml_predictions_total = Counter(
    'ml_predictions_total',
    'Total ML predictions',
    ['model', 'result']
)

ml_prediction_confidence = Histogram(
    'ml_prediction_confidence',
    'ML prediction confidence scores',
    ['model']
)
```

### 8.3 Health Check Endpoint

```python
# backend/health.py
from fastapi import APIRouter
from sqlalchemy import text

router = APIRouter()

@router.get("/health")
async def health_check(db = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Check database
        db.execute(text("SELECT 1"))
        
        # Check Redis
        redis_client.ping()
        
        return {
            "status": "healthy",
            "components": {
                "database": "ok",
                "cache": "ok",
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }, 503
```

---

## SECTION 9: TROUBLESHOOTING GUIDE

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Connection refused" | Backend not running | `docker-compose up backend` |
| "No module named 'fastapi'" | Dependencies not installed | `pip install -r requirements.txt` |
| CORS errors | Frontend URL not in CORS whitelist | Add to `CORS_ORIGINS` in `config.py` |
| 401 Unauthorized | JWT token missing/expired | Check `Authorization` header, refresh token |
| Database migration fails | Alembic not initialized | `alembic init alembic && alembic upgrade head` |
| Tests failing | Database not clean | `pytest --db=clear` or recreate database |
| Performance slow | N+1 query problem | Use `joinedload()` in SQLAlchemy queries |
| Images not loading | Incorrect image path | Use `/public/images/...` path prefix |

---

## SECTION 10: SIH DEMO PREPARATION

### 10.1 Demo Script (5 Minute Walk-through)

**Intro (30 seconds)**
"UdaanSetu bridges India's innovation gap. We show research, innovators, and investors a single platform to track the complete journey from idea to impact."

**1. Dashboard (1 minute)**
- Show greeting personalization
- Highlight pipeline visualization (Research → Innovation → IPR → Startup)
- Point out stats grid (counts by category)
- Showcase ML-powered at-risk detection
- Show recent activity feed

**2. Research Flow (1 minute 30 seconds)**
- Click "Create Research Project"
- Fill form (title, description, sector)
- Show validation (required fields)
- Submit → Show success toast
- View created project in list
- Click detail → Show milestones, linked records

**3. Smart Features (1 minute)**
- Show "Similar Projects" using semantic search
- Demo risk prediction (explain ML model)
- Show "Recommended Mentors" (smart matching)
- Highlight government integration badge

**4. Accessibility (1 minute)**
- Tab through interface (show keyboard navigation)
- Point out focus indicators (blue outlines)
- Mention WCAG 2.1 compliance
- Show mobile responsiveness

**Closing (30 seconds)**
"Every feature designed for trust, simplicity, and accessibility. From researcher to investor, UdaanSetu is ready to scale India's innovation."

### 10.2 Demo Credentials

```
Admin:
Email: admin@udaansetu.demo
Password: Demo@123

Researcher:
Email: researcher@udaansetu.demo
Password: Demo@123

Mentor:
Email: mentor@udaansetu.demo
Password: Demo@123

Investor:
Email: investor@udaansetu.demo
Password: Demo@123

Incubator:
Email: incubator@udaansetu.demo
Password: Demo@123
```

### 10.3 Pre-Demo Checklist

- [ ] All services running (frontend, backend, database)
- [ ] Demo data populated in database
- [ ] Environment variables set correctly
- [ ] API endpoints responding
- [ ] ML models loaded and generating predictions
- [ ] No console errors or warnings
- [ ] Tested on presentation laptop/screen
- [ ] Backup offline demo video ready
- [ ] Demo script memorized
- [ ] Team roles assigned (presenter, tech support)

---

## CONCLUSION

This implementation guide provides everything needed to build, deploy, and demo UdaanSetu as a production-grade platform. The combination of thoughtful design, robust backend, and comprehensive testing creates a system ready to scale India's innovation ecosystem.

**Key Takeaway:** Every technical decision (TypeScript, Postgres, Redis, Next.js, Docker) supports the UX principle of **trust through transparency**. A slow platform is untrustworthy. An inaccessible platform excludes users. A complex platform confuses decision-makers.

Build with discipline. Demo with confidence. Win SIH 2026.

🚀 **Udaan setu banaye — Bridge to Flight.**

---

**Document Version:** 2.0  
**Last Updated:** August 19, 2026  
**Maintainer:** UdaanSetu Development Team  
**License:** Internal Use Only (SIH 2026)
