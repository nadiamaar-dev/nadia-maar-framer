import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2020",
    cssCodeSplit: true,
    // Long-term caching: heavy, rarely-changing vendors get their own hashed
    // chunks so an app-code change doesn't bust the whole vendor cache, and
    // the browser can fetch them in parallel.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return
          if (id.includes("framer-motion")) return "framer-motion"
          if (id.includes("@supabase")) return "supabase"
          if (id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler")) return "react"
          return "vendor"
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
