import axios from "axios";
import { Job } from "../../types/types";
import { QuotaState } from "../context/QuotaContext";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: "manager" | "technician";
  phone: string;
  technician_id: number | null;
  specialties: string[];
  available: boolean | null;
  jobs_today: number | null;
  rating: number | null;
  years_experience: number | null;
  avatar_initials?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: AppUser;
}

export interface Customer {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  type: "Commercial" | "Residential" | "Healthcare" | string;
  active_jobs: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────
// Zero-config demo mode: when no .env is provided, the app points at a public,
// read-only MockMyData demo workspace so it works immediately after clone.
// Set EXPO_PUBLIC_API_BASE_URL in .env to override with your own workspace or backend.
const DEMO_BASE_URL = "https://sample-project.api.mockmydata.io"; // TODO: replace with your live demo tenant URL
const DEMO_API_KEY = "sk_8N1og4J8GBwru4FEJn7OTT0A49DV3RXWJjCyEHIbyNq5TOOX"; // TODO: replace with a read-only demo-scoped key

const hasCustomBase = !!process.env.EXPO_PUBLIC_API_BASE_URL;

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || DEMO_BASE_URL;
const API_KEY =
  process.env.EXPO_PUBLIC_API_KEY ?? (hasCustomBase ? "" : DEMO_API_KEY);

// Mock mode is explicit via env when set; otherwise it defaults to true only
// when running against the built-in demo workspace.
export const IS_MOCK =
  process.env.EXPO_PUBLIC_USE_MOCK_DATA != null
    ? process.env.EXPO_PUBLIC_USE_MOCK_DATA === "true"
    : !hasCustomBase;

if (!hasCustomBase && __DEV__) {
  console.info(
    "[api] No EXPO_PUBLIC_API_BASE_URL set — running against the MockMyData demo workspace.",
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

// ─── Axios instance ───────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

let _token: string | null = null;

export function setAuthToken(token: string | null) {
  _token = token;
}

client.interceptors.request.use((config) => {
  if (API_KEY) config.headers["x-api-key"] = API_KEY;
  if (_token && !IS_MOCK) config.headers["Authorization"] = `Bearer ${_token}`;
  return config;
});

// ─── Quota interceptor ────────────────────────────────────────────────────────
let _onQuotaExceeded: ((state: Partial<QuotaState>) => void) | null = null;

export function setQuotaHandler(fn: (state: Partial<QuotaState>) => void) {
  _onQuotaExceeded = fn;
}

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (IS_MOCK && err?.response?.status === 429 && _onQuotaExceeded) {
      const data = err.response?.data ?? {};
      _onQuotaExceeded({
        plan: data.plan ?? null,
        requestsUsed: data.requests_used ?? 0,
        limit: data.limit ?? data.daily_limit ?? 0,
      });
    }
    return Promise.reject(err);
  },
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AuthAPI = {
  login: async (email: string, password: string): Promise<AuthTokens> => {
    if (IS_MOCK) {
      const users: AppUser[] = await client
        .get("/api/users/")
        .then((r) => toArray<AppUser>(r.data));
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim(),
      );
      if (!user)
        return Promise.reject(new Error("No account found with that email."));
      return { access: "mock-token", refresh: "mock-token", user };
    }
    const data = await client
      .post("/api/users/login/", { email, password })
      .then((r) => r.data);
    return {
      access: data.tokens.access,
      refresh: data.tokens.refresh,
      user: data.user,
    };
  },

  signup: async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthTokens> => {
    if (IS_MOCK)
      return Promise.reject(
        new Error("Sign up is not available in demo mode."),
      );

    const data = await client
      .post("/api/users/register/", {
        name,
        email,
        password,
        password_confirm: password,
        role: "manager",
      })
      .then((r) => r.data);

    return {
      access: data.tokens.access,
      refresh: data.tokens.refresh,
      user: data.user,
    };
  },

  refresh: (refresh: string): Promise<{ access: string }> => {
    if (IS_MOCK) return Promise.resolve({ access: "mock-token" });
    return client
      .post("/api/auth/token/refresh/", { refresh })
      .then((r) => r.data);
  },

  logout: (): Promise<void> => {
    if (IS_MOCK) return Promise.resolve();
    return client.post("/api/auth/logout/").then(() => undefined);
  },
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const JobsAPI = {
  getAll: (): Promise<Job[]> =>
    client.get("/api/jobs/").then((r) => toArray<Job>(r.data)),
  create: (job: Omit<Job, "id">): Promise<Job> =>
    client.post("/api/jobs/", job).then((r) => r.data),
  update: (id: number, job: Partial<Job>): Promise<Job> =>
    client.patch(`/api/jobs/${id}/`, job).then((r) => r.data),
  delete: (id: number): Promise<void> =>
    client.delete(`/api/jobs/${id}/`).then(() => undefined),
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const CustomersAPI = {
  getAll: (): Promise<Customer[]> =>
    client.get("/api/customers/").then((r) => toArray<Customer>(r.data)),
  getById: (id: number): Promise<Customer> =>
    client.get(`/api/customers/${id}/`).then((r) => r.data),
  create: (c: Omit<Customer, "id">): Promise<Customer> =>
    client.post("/api/customers/", c).then((r) => r.data),
  update: (id: number, c: Partial<Customer>): Promise<Customer> =>
    client.patch(`/api/customers/${id}/`, c).then((r) => r.data),
  delete: (id: number): Promise<void> =>
    client.delete(`/api/customers/${id}/`).then(() => undefined),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const UsersAPI = {
  getAll: (): Promise<AppUser[]> =>
    client.get("/api/users/").then((r) => toArray<AppUser>(r.data)),
  getById: (id: number): Promise<AppUser> =>
    client.get(`/api/users/${id}/`).then((r) => r.data),
  getTechnicians: (): Promise<AppUser[]> =>
    client.get("/api/users/").then((r) => toArray<AppUser>(r.data)),
  create: (u: Omit<AppUser, "id">): Promise<AppUser> =>
    client.post("/api/users/", u).then((r) => r.data),
  update: (id: number, u: Partial<AppUser>): Promise<AppUser> =>
    client.patch(`/api/users/${id}/`, u).then((r) => r.data),
  delete: (id: number): Promise<void> =>
    client.delete(`/api/users/${id}/`).then(() => undefined),
};

export default client;
