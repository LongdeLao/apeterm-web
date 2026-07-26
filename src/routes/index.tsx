import { createFileRoute } from "@tanstack/react-router";
import { ApeTermWeb } from "./app";

export const Route = createFileRoute("/")({
  component: ApeTermWeb,
});
