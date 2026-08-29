/* ── PatientTriage.ai — Centralized API Client ───────────────────────────── */
import type {
  AuthResponse,
  Patient,
  TriageResult,
  WaitingRoomResponse,
  SurgeStatus,
  AuditEntry,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Generic Fetch Helper ───────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Attach JWT token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pt_jwt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ── Authentication Endpoints ───────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(userData: {
  email: string;
  password: string;
  name: string;
  role?: string;
  hospital?: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function fetchCurrentUser(
  token: string
): Promise<{ user: import('./types').User }> {
  return apiFetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchDemoUsers(): Promise<{
  demo_users: import('./types').DemoUser[];
}> {
  return apiFetch('/api/auth/demo-users');
}

// ── Patient Endpoints ──────────────────────────────────────────────────────

export async function fetchPatients(): Promise<Patient[]> {
  return apiFetch<Patient[]>('/api/patients');
}

export async function fetchPatient(patientId: string): Promise<Patient> {
  return apiFetch<Patient>(`/api/patients/${patientId}`);
}

// ── Triage Endpoints ───────────────────────────────────────────────────────

export async function runTriage(patientId: string): Promise<TriageResult> {
  return apiFetch<TriageResult>('/api/triage', {
    method: 'POST',
    body: JSON.stringify({ patient_id: patientId }),
  });
}

export async function runCustomTriage(
  patient: Record<string, unknown>
): Promise<TriageResult> {
  return apiFetch<TriageResult>('/api/triage/custom', {
    method: 'POST',
    body: JSON.stringify(patient),
  });
}

export async function submitOverride(data: {
  patient_id: string;
  original_esi: number;
  new_esi: number;
  reason: string;
  nurse_id: string;
}): Promise<{ status: string; patient_id: string; new_esi: number; message: string }> {
  return apiFetch('/api/override', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function confirmRoute(data: {
  patient_id: string;
  name?: string;
  final_esi?: number;
  target_bay?: string;
  nurse_id?: string;
}): Promise<{ status: string; patient_id: string; target_bay: string; timestamp: string }> {
  return apiFetch('/api/triage/confirm', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Waiting Room Endpoints ─────────────────────────────────────────────────

export async function fetchWaitingRoom(): Promise<WaitingRoomResponse> {
  return apiFetch<WaitingRoomResponse>('/api/waiting-room');
}

export async function addToWaitingRoom(data: {
  patient_id: string;
  name: string;
  esi_level: number;
}): Promise<{ status: string; queue_size: number }> {
  return apiFetch('/api/waiting-room/add', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchAlerts(): Promise<
  { patient_id: string; name: string; esi_level: number; wait_minutes: number; threshold: number; message: string }[]
> {
  return apiFetch('/api/waiting-room/alerts');
}

// ── Surge Endpoints ────────────────────────────────────────────────────────

export async function fetchSurgeStatus(): Promise<SurgeStatus> {
  return apiFetch<SurgeStatus>('/api/surge');
}

export async function toggleSurge(): Promise<{
  is_surge: boolean;
  surge_level: string;
}> {
  return apiFetch('/api/surge/toggle', { method: 'POST' });
}

// ── Audit Endpoints ────────────────────────────────────────────────────────

export async function fetchAuditLogs(): Promise<AuditEntry[]> {
  return apiFetch<AuditEntry[]>('/api/audit');
}

export async function fetchPatientAuditLogs(
  patientId: string
): Promise<AuditEntry[]> {
  return apiFetch<AuditEntry[]>(`/api/audit/${patientId}`);
}

// ── Config Endpoints ───────────────────────────────────────────────────────

export async function fetchConfig(): Promise<Record<string, unknown>> {
  return apiFetch('/api/config');
}

export async function updateProfile(
  profile: string
): Promise<{ status: string; profile: string }> {
  return apiFetch('/api/config/profile', {
    method: 'POST',
    body: JSON.stringify({ profile }),
  });
}
