/**
 * http-client.ts — the ClinicOS HTTP boundary.
 *
 * Governed by: docs/Brain.md §4/§5.3 ("Typed client behind HttpClient interface … never
 * imported in UI") and docs/architecture/Architecture.md §9.1 (request/auth/tenant headers;
 * response Zod-validation + error mapping at this boundary).
 *
 * ────────────────────────────────────────────────────────────────────────────
 * THE UI (and feature/entity code) MUST NEVER IMPORT axios DIRECTLY.
 * It talks to repositories, which depend on this `HttpClient` interface. Swapping axios
 * for fetch/ky later is a one-file change here, with zero call-site edits.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Interceptors implemented here (once, centrally):
 *   - request: base URL + timeout from env; a per-request `X-Request-Id`; and HOOK
 *     placeholders for auth + tenant headers (wired in Phase 4 when AuthProvider/session
 *     store exist — see comments).
 *   - response: map ANY failure to a typed AppError (shared/errors) and log it (PHI-free)
 *     via the logger port, so repositories/UI only ever see AppError.
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { env } from '@shared/config';
import { toAppError } from '@shared/errors';
import { createLogger } from '@shared/logger';

const log = createLogger('api');

/** Options accepted by the HttpClient methods (a thin, library-agnostic subset). */
export interface HttpRequestOptions {
  /** Query parameters. */
  params?: Record<string, unknown>;
  /** Extra headers for this call. */
  headers?: Record<string, string>;
  /** Per-request timeout override (ms). */
  timeoutMs?: number;
  /** Abort signal for cancellation. */
  signal?: AbortSignal;
}

/**
 * HttpClient — the stable HTTP contract. Repositories depend on THIS, never on axios.
 * Methods return parsed JSON as `unknown`; the caller (repository) validates with Zod and
 * maps DTO → Model (Architecture §7). Failures reject with a typed `AppError`.
 */
export interface HttpClient {
  get<T = unknown>(url: string, options?: HttpRequestOptions): Promise<T>;
  post<T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
  put<T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
  patch<T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
  delete<T = unknown>(url: string, options?: HttpRequestOptions): Promise<T>;
}

/** Generate a request-correlation id (safe to log; never contains PHI). */
function makeRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * AxiosHttpClient — the default HttpClient implementation. Encapsulates the only axios
 * instance in the codebase; interceptors live here so cross-cutting concerns are applied
 * exactly once.
 */
export class AxiosHttpClient implements HttpClient {
  private readonly instance: AxiosInstance;

  constructor(baseURL: string = env.VITE_API_BASE_URL, timeout: number = env.VITE_API_TIMEOUT_MS) {
    this.instance = axios.create({
      baseURL,
      timeout,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });
    this.registerRequestInterceptor();
    this.registerResponseInterceptor();
  }

  private registerRequestInterceptor(): void {
    this.instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      // Correlation id — echoed in logs/diagnostics; never carries PHI.
      config.headers.set('X-Request-Id', makeRequestId());

      // ── AUTH HEADER HOOK (placeholder) ───────────────────────────────────
      // Phase 4 wires the session store / AuthProvider. When available:
      //   const token = sessionStore.getState().accessToken;
      //   if (token) config.headers.set('Authorization', `Bearer ${token}`);
      // Kept as a comment so the boundary is the ONLY place auth is attached.

      // ── TENANT HEADER HOOK (placeholder) ─────────────────────────────────
      // Multi-tenancy (Architecture §6): inject the active clinic once, here.
      //   const tenantId = sessionStore.getState().tenantId;
      //   if (tenantId) config.headers.set('X-Tenant-Id', tenantId);

      return config;
    });
  }

  private registerResponseInterceptor(): void {
    this.instance.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        const appError = toAppError(error);
        // PHI-free diagnostic: code/status only, never request/response bodies.
        log.error('HTTP request failed', appError, {
          code: appError.code,
          status: appError.status,
        });
        return Promise.reject(appError);
      },
    );
  }

  /** Translate our library-agnostic options into an axios request config. */
  private toConfig(options?: HttpRequestOptions): AxiosRequestConfig {
    const config: AxiosRequestConfig = {};
    if (options?.params) config.params = options.params;
    if (options?.headers) config.headers = options.headers;
    if (options?.timeoutMs !== undefined) config.timeout = options.timeoutMs;
    if (options?.signal) config.signal = options.signal;
    return config;
  }

  async get<T = unknown>(url: string, options?: HttpRequestOptions): Promise<T> {
    const { data } = await this.instance.get<T>(url, this.toConfig(options));
    return data;
  }

  async post<T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    const { data } = await this.instance.post<T>(url, body, this.toConfig(options));
    return data;
  }

  async put<T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    const { data } = await this.instance.put<T>(url, body, this.toConfig(options));
    return data;
  }

  async patch<T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    const { data } = await this.instance.patch<T>(url, body, this.toConfig(options));
    return data;
  }

  async delete<T = unknown>(url: string, options?: HttpRequestOptions): Promise<T> {
    const { data } = await this.instance.delete<T>(url, this.toConfig(options));
    return data;
  }
}

/**
 * httpClient — the app-wide singleton repositories depend on. The ONLY HttpClient
 * instance; the ONLY place axios lives.
 */
export const httpClient: HttpClient = new AxiosHttpClient();
