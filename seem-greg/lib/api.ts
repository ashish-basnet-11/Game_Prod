// lib/api.ts
// All fetch calls go through here.
// Auth tokens are in httpOnly cookies — never touched by this code.
// The only thing we manage client-side is the CSRF token,
// which we read from the sg_csrf cookie and send as a header.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Badge = "HOT" | "NEW" | "TOP" | "";
export type Category = "Slots" | "Fish Games" | "Table Games";

export interface Game {
  id: string;
  name: string;
  emoji: string;
  color: string;
  badge: Badge;
  category: Category;
  description: string;
  gameUrl: string;
  isNew: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
}

export interface GamesQuery {
  category?: Category | "All" | "New";
  search?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ── CSRF helper ───────────────────────────────────────────────────────────────
// Read the CSRF token from the readable sg_csrf cookie.
// This is intentionally NOT httpOnly so the frontend can read it.
function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)sg_csrf=([^;]+)/);
  return match ? match[1] : "";
}

// ── Base fetch ────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit & { revalidate?: number; isServerSide?: boolean } = {}
): Promise<T> {
  const { revalidate, isServerSide, ...fetchOptions } = options;
  const method = (fetchOptions.method || "GET").toUpperCase();

  // State-changing requests get the CSRF token header (client-side only)
  const csrfHeaders: Record<string, string> =
    !isServerSide && ["POST", "PUT", "PATCH", "DELETE"].includes(method)
      ? { "X-CSRF-Token": getCsrfToken() }
      : {};

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders,
      ...fetchOptions.headers,
    },
    // Always send cookies (httpOnly cookies go automatically with credentials: include)
    credentials: "include",
    // Next.js cache — server components only
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });

  // Handle 401 with TOKEN_EXPIRED — caller can attempt refresh
  if (res.status === 401) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(401, body.message || "Unauthorized", body.code);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message || "Request failed");
  }

  return res.json();
}

// ── Token refresh ─────────────────────────────────────────────────────────────
// Called automatically when an access token expires.
// The refresh token is in an httpOnly cookie — no JS interaction needed.
export async function refreshSession(): Promise<AdminUser> {
  const res = await apiFetch<ApiResponse<{ user: AdminUser }>>("/auth/refresh", {
    method: "POST",
  });
  return res.data.user;
}

/**
 * Wraps any admin API call with automatic token refresh on expiry.
 * If refresh also fails, throws so the caller can redirect to login.
 */
async function withAutoRefresh<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && err.code === "TOKEN_EXPIRED") {
      // Try to refresh once
      await refreshSession();
      return fn(); // retry original call
    }
    throw err;
  }
}

// ── Public API (server components) ───────────────────────────────────────────

export async function getGames(query?: GamesQuery): Promise<Game[]> {
  const params = new URLSearchParams();
  if (query?.category && query.category !== "All" && query.category !== "New") {
    params.set("category", query.category);
  }
  if (query?.search) params.set("search", query.search);

  const qs = params.toString();
  const path = `/games${qs ? `?${qs}` : ""}`;
  const res = await apiFetch<ApiResponse<Game[]>>(path, {
    revalidate: 60,
    isServerSide: true,
  });

  let games = res.data;
  if (query?.category === "New") games = games.filter(g => g.isNew);
  return games;
}

export async function getGame(id: string): Promise<Game> {
  const res = await apiFetch<ApiResponse<Game>>(`/games/${id}`, {
    revalidate: 60,
    isServerSide: true,
  });
  return res.data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginAdmin(
  email: string,
  password: string
): Promise<AdminUser> {
  // Login sets httpOnly cookies — we only get the user object back
  const res = await apiFetch<ApiResponse<{ user: AdminUser }>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res.data.user;
}

export async function logoutAdmin(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
}

export async function getMe(): Promise<AdminUser> {
  const res = await apiFetch<ApiResponse<{ user: AdminUser }>>("/auth/me");
  return res.data.user;
}

// ── Admin game operations (client components) ─────────────────────────────────
// All wrapped with auto-refresh — expired access tokens are silently refreshed.

export async function adminGetGames(): Promise<Game[]> {
  return withAutoRefresh(async () => {
    const res = await apiFetch<ApiResponse<Game[]>>("/games/admin/all", {
      cache: "no-store",
    });
    return res.data;
  });
}

export async function adminCreateGame(
  data: Omit<Game, "id" | "createdAt" | "updatedAt">
): Promise<Game> {
  return withAutoRefresh(async () => {
    const res = await apiFetch<ApiResponse<Game>>("/games/admin", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  });
}

export async function adminUpdateGame(id: string, data: Partial<Game>): Promise<Game> {
  return withAutoRefresh(async () => {
    const res = await apiFetch<ApiResponse<Game>>(`/games/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.data;
  });
}

export async function adminToggleGame(id: string): Promise<Game> {
  return withAutoRefresh(async () => {
    const res = await apiFetch<ApiResponse<Game>>(`/games/admin/${id}/toggle`, {
      method: "PATCH",
    });
    return res.data;
  });
}

export async function adminDeleteGame(id: string): Promise<void> {
  return withAutoRefresh(async () => {
    await apiFetch(`/games/admin/${id}`, { method: "DELETE" });
  });
}