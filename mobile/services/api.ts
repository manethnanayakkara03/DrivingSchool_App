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
    return 'http://172.20.10.9:5000'; // Your local network IP
  }
  return 'http://172.20.10.9:5000'; // Default for emulator
};

export const BASE_URL = getBaseUrl();
console.log('📡 API BASE_URL:', BASE_URL);

// In-memory token store (survives the session)
let _token: string | null = null;
let _user: any | null = null;

export const setToken = (t: string | null) => { _token = t; };
export const getToken = ()                  => _token;
export const clearToken = ()                => { _token = null; };

export const setUser = (u: any | null) => { _user = u; };
export const getUser = ()              => _user;
export const clearUser = ()             => { _user = null; };

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
    request<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
      'POST', '/api/auth/login', { email, password }
    ),
  register: (name: string, email: string, password: string, extra: { nic: string; phone: string; address: string }) =>
    request<{ token: string; user: any; message: string }>(
      'POST', '/api/auth/register', { name, email, password, ...extra }
    ),
};

// ─── learner ──────────────────────────────────────────────────────────────────

export const learnerApi = {
  getCourses: () => request<any[]>('GET', '/api/learner/courses'),
  enroll: (learnerId: string, courseId: string, paymentData?: any) => 
    request<any>('POST', '/api/learner/enroll', { learnerId, courseId, paymentData }),
  getMyCourses: (learnerId: string) => request<any[]>('GET', `/api/learner/my-courses/${learnerId}`),
  getStats:     (learnerId: string) => request<any>('GET', `/api/learner/stats/${learnerId}`),
  pay: (enrollmentId: string, amount: number, method: string) => 

    request<any>('POST', '/api/learner/pay', { enrollmentId, amount, method }),
  getMyPayments: (learnerId: string) => request<any[]>('GET', `/api/learner/my-payments/${learnerId}`),
  updateProfile: (id: string, data: any) => request<any>('PUT', `/api/learner/profile/${id}`, data),
};

// ─── instructor ───────────────────────────────────────────────────────────────

export const instructorApi = {
  getMyStudents: (email: string) => request<any[]>('GET', `/api/instructor/my-students/${email}`),
  updateEnrollmentStatus: (id: string, data: { status: string; progress: number }) => 
    request<any>('PUT', `/api/instructor/enrollment-status/${id}`, data),
  getProfile: (email: string) => request<any>('GET', `/api/instructor/profile/${email}`),
  updateProfile: (id: string, data: any) => request<any>('PUT', `/api/instructor/profile/${id}`, data),
  createAccount: (data: any) => request<any>('POST', '/api/instructor/create-account', data),
};

// ─── dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  stats: () =>
    request<{ learners: number; instructors: number; vehicles: number; bookings: number; revenue: number }>(
      'GET', '/api/dashboard/stats'
    ),
};

// ─── upload ───────────────────────────────────────────────────────────────────

export const uploadApi = {
  uploadImage: async (uri: string) => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('image', {
      uri,
      name: filename,
      type,
    } as any);

    const res = await fetch(`${BASE_URL}/api/upload/image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data as { url: string; public_id: string };
  },
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

export const adminApi = {
  getPendingEnrollments: () => request<any[]>('GET', '/api/learner/pending-enrollments'),
  getEnrolledStudents:   () => request<any[]>('GET', '/api/learner/enrolled-students'),
  approveEnrollment: (id: string) => request<any>('POST', `/api/learner/approve-enrollment/${id}`),
};

export const learnersApi    = resourceApi('learners');

export const instructorsApi = resourceApi('instructors');
export const vehiclesApi    = resourceApi('vehicles');
export const bookingsApi    = resourceApi('bookings');
export const paymentsApi    = resourceApi('payments');
export const maintenanceApi = resourceApi('maintenance');
export const coursesApi     = resourceApi('courses');

// map screen `type` param → api object
export const apiForType: Record<string, ReturnType<typeof resourceApi>> = {
  learners:    learnersApi,
  instructors: instructorsApi,
  vehicles:    vehiclesApi,
  bookings:    bookingsApi,
  payments:    paymentsApi,
  maintenance: maintenanceApi,
  courses:     coursesApi,
};
