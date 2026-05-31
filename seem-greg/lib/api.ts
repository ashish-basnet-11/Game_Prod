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
  imageUrl: string | null; // null = no image uploaded; fall back to emoji
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
function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)sg_csrf=([^;]+)/);
  return match ? match[1] : "";
}

// ── Base fetch (JSON) ─────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit & { revalidate?: number; isServerSide?: boolean } = {}
): Promise<T> {
  const { revalidate, isServerSide, ...fetchOptions } = options;
  const method = (fetchOptions.method || "GET").toUpperCase();

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
    credentials: "include",
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });

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

// ── Multipart fetch (FormData — for endpoints that accept file uploads) ────────
// Does NOT set Content-Type; the browser sets it automatically with the
// correct multipart boundary when the body is FormData.

async function apiFetchFormData<T>(path: string, method: "POST" | "PUT", formData: FormData): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      // No Content-Type header — browser sets multipart/form-data + boundary
      "X-CSRF-Token": getCsrfToken(),
    },
    credentials: "include",
    body: formData,
  });

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

export async function refreshSession(): Promise<AdminUser> {
  const res = await apiFetch<ApiResponse<{ user: AdminUser }>>("/auth/refresh", {
    method: "POST",
  });
  return res.data.user;
}

async function withAutoRefresh<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && err.code === "TOKEN_EXPIRED") {
      await refreshSession();
      return fn();
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

export async function loginAdmin(email: string, password: string, captcha: string): Promise<AdminUser> {
  // 1. Validate CAPTCHA against our Next.js API proxy
  const captchaRes = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ captcha }),
  });

  if (!captchaRes.ok) {
    const body = await captchaRes.json().catch(() => ({ message: captchaRes.statusText }));
    throw new ApiError(captchaRes.status, body.message || "CAPTCHA failed");
  }

  // 2. Now that CAPTCHA is valid, hit the real backend directly to authenticate
  // The backend will send Set-Cookie directly to the browser for the backend domain!
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

// ── Admin game operations ─────────────────────────────────────────────────────

export async function adminGetGames(): Promise<Game[]> {
  return withAutoRefresh(async () => {
    const res = await apiFetch<ApiResponse<Game[]>>("/games/admin/all", {
      cache: "no-store",
    });
    return res.data;
  });
}

// GameFormData is what the form sends — image is a File or null, not part of Game
export interface GameFormData {
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
  image?: File | null;       // new upload
  removeImage?: boolean;     // explicit removal (edit only)
}

/**
 * Builds a FormData object from GameFormData.
 * Always sends as multipart so the server can handle both
 * JSON-only and file-upload cases with the same endpoint.
 */
function buildFormData(data: GameFormData): FormData {
  const fd = new FormData();
  fd.append("name", data.name);
  fd.append("emoji", data.emoji);
  fd.append("color", data.color);
  fd.append("badge", data.badge);
  fd.append("category", data.category);
  fd.append("description", data.description);
  fd.append("gameUrl", data.gameUrl ?? "");
  fd.append("isNew", String(data.isNew));
  fd.append("isActive", String(data.isActive));
  fd.append("sortOrder", String(data.sortOrder));
  if (data.image) fd.append("image", data.image);
  if (data.removeImage) fd.append("removeImage", "true");
  return fd;
}

export async function adminCreateGame(data: GameFormData): Promise<Game> {
  return withAutoRefresh(async () => {
    const res = await apiFetchFormData<ApiResponse<Game>>(
      "/games/admin",
      "POST",
      buildFormData(data)
    );
    return res.data;
  });
}

export async function adminUpdateGame(id: string, data: GameFormData): Promise<Game> {
  return withAutoRefresh(async () => {
    const res = await apiFetchFormData<ApiResponse<Game>>(
      `/games/admin/${id}`,
      "PUT",
      buildFormData(data)
    );
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

// ── Lucky Spin Wheel ──────────────────────────────────────────────────────────

export interface SpinReward {
  id: string;
  label: string;
  color: string;
  weight: number;
  sortOrder: number;
  isActive: boolean;
}

export interface SpinResult {
  success: boolean;
  winningIndex?: number;
  reward?: string;
  message?: string;
  msRemaining?: number;
}

export interface SpinLog {
  id: string;
  fingerprint: string;
  reward: string;
  lastSpunAt: string;
}

/** Public — no auth required */
export async function executeSpin(fingerprint: string): Promise<SpinResult> {
  const res = await fetch(`${API_URL}/spin/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fingerprint }),
  });
  return res.json();
}

/** Public — get active rewards config */
export async function getPublicSpinRewardsApi(): Promise<SpinReward[]> {
  const res = await fetch(`${API_URL}/spin/rewards`);
  const data = await res.json();
  return data.data || [];
}

/** Public — check spin cooldown status */
export async function checkSpinStatusApi(fingerprint: string): Promise<{ canSpin: boolean; msRemaining?: number }> {
  const res = await fetch(`${API_URL}/spin/status?fingerprint=${encodeURIComponent(fingerprint)}`);
  const data = await res.json();
  return data;
}

/** Admin — get rewards config */
export async function getSpinRewards(): Promise<SpinReward[]> {
  return withAutoRefresh(async () => {
    const res = await apiFetch<ApiResponse<SpinReward[]>>("/spin/admin/rewards");
    return res.data;
  });
}

/** Admin — bulk-save rewards */
export async function saveSpinRewards(rewards: Partial<SpinReward>[]): Promise<SpinReward[]> {
  return withAutoRefresh(async () => {
    const res = await apiFetch<ApiResponse<SpinReward[]>>("/spin/admin/rewards", {
      method: "POST",
      body: JSON.stringify({ rewards }),
    });
    return res.data;
  });
}

/** Admin — get spin logs */
export async function getSpinLogs(): Promise<SpinLog[]> {
  return withAutoRefresh(async () => {
    const res = await apiFetch<ApiResponse<SpinLog[]>>("/spin/admin/logs");
    return res.data;
  });
}