import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// A stray package-lock.json in the user's home directory makes Next infer the
// wrong workspace root, which pulls the whole home folder into module
// resolution and file watching. Pin it to this project.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
