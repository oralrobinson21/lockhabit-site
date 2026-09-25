import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/creator")({
  component: CreatorLayout,
});

function CreatorLayout() {
  return <Outlet />;
}
