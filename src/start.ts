import { createStart, createCsrfMiddleware } from "@tanstack/react-start";
import { isRedirect, isNotFound } from "@tanstack/react-router";
import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = {
  server: async ({ next }: any) => {
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

const csrfMiddleware = createCsrfMiddleware();

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware as any],
  functionMiddleware: [csrfMiddleware],
}));