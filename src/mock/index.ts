/**
 * src/mock — public API barrel for the MSW mocking layer.
 * Governed by docs/Brain.md §4. The app composition root imports the worker from here.
 */
export { worker } from './browser';
export { handlers } from './handlers';
