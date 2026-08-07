import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

/**
 * _admin.tsx — layout route for all admin-only pages (/admin/*).
 * Requires isAdmin === true. Non-admins are redirected to /.
 */
export const Route = createFileRoute("/_admin")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/login" });
    }
    if (!context.user.isAdmin) {
      throw redirect({ to: "/" });
    }
  },
  component: () => <Outlet />,
});
