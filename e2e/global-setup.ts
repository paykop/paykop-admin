import { request } from "@playwright/test";

const PORT = process.env.PLAYWRIGHT_PORT ?? "3099";
const baseURL = `http://localhost:${PORT}`;

export default async function globalSetup() {
  const api = await request.newContext();
  const deadline = Date.now() + 120000;

  while (Date.now() < deadline) {
    try {
      const response = await api.get(`${baseURL}/sign-in`);
      const body = await response.text();
      if (response.ok() && body.includes("Paykop Admin")) {
        return;
      }
    } catch {
      // Server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(
    `Paykop Admin app not reachable at ${baseURL}. Another app may be bound to PLAYWRIGHT_PORT.`
  );
}
