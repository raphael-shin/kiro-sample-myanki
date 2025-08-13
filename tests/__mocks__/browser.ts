import { setupWorker } from 'msw';
import { handlers } from './handlers';

// This configures a Service Worker with the given request handlers
// for browser testing (if needed in the future)
export const worker = setupWorker(...handlers);