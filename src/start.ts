import { createStart, createCsrfMiddleware } from "@tanstack/react-start";
import { isRedirect, isNotFound } from "@tanstack/react-router";
import { renderErrorPage } from "./lib/error-page";

// Middleware request global (manual, tanpa createMiddleware)
const errorRequestMiddleware = {
  type: "request" as const,
  middleware: async ({ next }: any) => {
    try {
      return await next();
    } catch (error) {
      if (
        isRedirect(error) ||
        isNotFound(error) ||
        (error != null &&
          typeof error === "object" &&
          "statusCode" in error)
      ) {
        throw error;
      }

      console.error(error);

      return new Response(renderErrorPage(), {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    }
  },
};

// CSRF middleware (pakai helper resmi)
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  // jalan di semua request SSR (termasuk server routes, serverFn)
  requestMiddleware: [csrfMiddleware, errorRequestMiddleware],
  // kalau mau tambah function-only middleware, bisa pakai:
  // functionMiddleware: [csrfMiddleware],
}));