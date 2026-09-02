import type { NextConfig } from "next";

// Deliberadamente sin `runtime = "edge"` en ningun route handler: en Netlify el
// edge runtime igualmente se ejecuta en la region de funciones, no aporta nada
// y anade limitaciones (ver seccion 2 del encargo original / CLAUDE.md).
const nextConfig: NextConfig = {};

export default nextConfig;
