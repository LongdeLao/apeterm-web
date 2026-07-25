import { cp, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await cp(".output", "dist", { recursive: true });
await cp("dist/server/index.mjs", "dist/server/index.js");
