import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { isRedirect, isNotFound } from "@tanstack/react-router";
import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (
      isRedirect(error) ||
      isNotFound(error) ||
      (error != null && typeof error === "object" && "statusCode" in error)
    ) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const defaultCsrfMiddleware = createMiddleware().server(async (ctx) => {
  if ((ctx as any).handlerType === "serverFn") {
    const origin = ctx.request.headers.get("Origin");
    if (origin) {
      const requestOrigin = new URL(ctx.request.url).origin;
      if (origin !== requestOrigin) {
        return new Response("Forbidden (CSRF)", { status: 403 });
      }
    }
  }
  return await ctx.next();
});

const csrfMiddleware =
  typeof createCsrfMiddleware === "function"
    ? createCsrfMiddleware({
        filter: (ctx) => ctx.handlerType === "serverFn",
      })
    : defaultCsrfMiddleware;

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
