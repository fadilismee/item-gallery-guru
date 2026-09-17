import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    nitro(),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    // Vite 8 native tsconfig paths (replaces vite-tsconfig-paths plugin)
    tsconfigPaths: true,
  },
  server: {
    // host: true -> dev server bisa diakses admin lain lewat LAN kantor
    // (mis. http://192.168.1.10:3000/admin-login dari HP/PC se-WiFi).
    host: true,
    allowedHosts: true,
  },
});
