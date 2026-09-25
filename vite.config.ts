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
    // (mis. http://192.168.1.10:3001/admin-login dari HP/PC se-WiFi).
    // Port 3001 (bukan 3000) karena port 3000 dipakai service Windows lain (iphlpsvc)
    // yang membuat browser salah sambung saat buka localhost:3000.
    host: true,
    port: 3001,
    allowedHosts: true,
  },
});
