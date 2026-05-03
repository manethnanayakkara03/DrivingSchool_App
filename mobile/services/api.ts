/**
 * Central API service for Arampath Driving School.
 *
 * ⚠️  BASE_URL:
 *   - Web (localhost):        http://localhost:5000
 *   - Android emulator:       http://10.0.2.2:5000
 *   - Physical device:        http://<YOUR_LOCAL_IP>:5000   e.g. http://192.168.1.5:5000
 */

import { Platform } from 'react-native';

// Auto-detect the correct BASE_URL based on platform
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  } else if (Platform.OS === 'ios') {
    return 'http://172.20.10.2:5000'; // Your local network IP
  }
  return 'http://10.0.2.2:5000'; // Default for emulator
};

export const BASE_URL = getBaseUrl();

// In-memory token store (survives the session)
let _token: string | null = null;

export const setToken = (t: string | null) => { _token = t; };
export const getToken = ()                  => _token;
export const clearToken = ()                => { _token = null; };

// ─── generic helpers ─────────────────────────────────────────────────────────

function headers(extra?: Record<string, string>) {
  return {
    'Content-Type': 'application/json',
    ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
    ...extra,
  };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data as T;
}

// ─── auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; admin: { name: string; email: string } }>(
      'POST', '/api/auth/login', { email, password }
    ),
};

// ─── dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  stats: () =>
    request<{ learners: number; instructors: number; vehicles: number; bookings: number; revenue: number }>(
      'GET', '/api/dashboard/stats'
    ),
};

// ─── report ───────────────────────────────────────────────────────────────────

export const reportApi = {
  generate: () =>
    request<any>('GET', '/api/report/generate'),
  
  download: () => {
    const url = `${BASE_URL}/api/report/download`;
    const token = _token;
    const fullUrl = token ? `${url}?token=${token}` : url;
    
    if (typeof window !== 'undefined') {
      // Web platform
      window.open(fullUrl, '_blank');
      return Promise.resolve({ success: true });
    } else {
      // Mobile platform - trigger download
      return fetch(url, {
        method: 'GET',
        headers: headers(),
      })
        .then(res => res.text())
        .then(html => {
          // For mobile, we could use WebView or open in browser
          return { html, success: true };
        });
    }
  },
};

// ─── resource CRUD ───────────────────────────────────────────────────────────

function resourceApi(resource: string) {
  return {
    list:   ()                  => request<any[]>('GET',    `/api/${resource}`),
    create: (data: any)         => request<any>( 'POST',   `/api/${resource}`, data),
    update: (id: string, data: any) => request<any>('PUT', `/api/${resource}/${id}`, data),
    remove: (id: string)        => request<any>( 'DELETE', `/api/${resource}/${id}`),
  };
}

export const learnersApi    = resourceApi('learners');
export const instructorsApi = resourceApi('instructors');
export const vehiclesApi    = resourceApi('vehicles');
export const bookingsApi    = resourceApi('bookings');
export const paymentsApi    = resourceApi('payments');
export const maintenanceApi = resourceApi('maintenance');

// map screen `type` param → api object
export const apiForType: Record<string, ReturnType<typeof resourceApi>> = {
  learners:    learnersApi,
  instructors: instructorsApi,
  vehicles:    vehiclesApi,
  bookings:    bookingsApi,
  payments:    paymentsApi,
  maintenance: maintenanceApi,
};
