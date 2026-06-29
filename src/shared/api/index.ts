/**
 * shared/api — public API barrel.
 * Governed by docs/Brain.md §5.3. Repositories import the HttpClient contract + singleton
 * from here. UI/feature code must NOT import this for raw calls — it goes through
 * repositories. Axios is never exported.
 */
export type { HttpClient, HttpRequestOptions } from './http-client';
export { AxiosHttpClient, httpClient } from './http-client';
