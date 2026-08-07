import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

/**
 * _auth.tsx — layout route for all protected pages.
 * All child routes nested under _auth/ require a valid session.
 * If not authenticated, redirects to /login.
 */
export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />,
});
