import { createFileRoute } from "@tanstack/react-router";
import { AuthenticatedApeTerm } from "./app";

export const Route = createFileRoute("/")({
  component: AuthenticatedApeTerm,
});
