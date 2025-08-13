import { rest } from 'msw';

// Mock handlers for API requests
// Currently empty as MyAnki is a client-side only app
// This can be extended in the future if external APIs are needed
export const handlers = [
  // Example handler for future API endpoints
  // rest.get('/api/example', (req, res, ctx) => {
  //   return res(ctx.json({ message: 'Mock response' }));
  // }),
];

// Export individual handler creators for testing
export const createMockHandler = (url: string, response: any) => {
  return rest.get(url, (_req, res, ctx) => {
    return res(ctx.json(response));
  });
};

export const createMockErrorHandler = (url: string, status: number = 500) => {
  return rest.get(url, (_req, res, ctx) => {
    return res(ctx.status(status));
  });
};