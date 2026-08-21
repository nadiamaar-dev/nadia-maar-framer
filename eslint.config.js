import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"

/* ══════════════════════════════════════════════════════════════════════════
   REGOLE DEL LINT.

   Il progetto non ne aveva. La pagina /corporate però vende «TypeScript,
   test end-to-end e integrazione continua»: una promessa che il repository
   non manteneva. Questo file, i test in tests/ e il workflow in
   .github/workflows la rendono vera — e da lì diventa anche un argomento di
   vendita invece che un rischio.

   La configurazione è deliberatamente stretta su ciò che rompe le pagine e
   larga su ciò che è solo questione di gusto:

   · `react-hooks` in modalità raccomandata. Le dipendenze mancanti in una
     useEffect sono la classe di bug più costosa in questo progetto: si
     manifestano come «a volte non si aggiorna», che nessuno riesce a
     riprodurre.
   · `no-unused-vars` come AVVISO e con le variabili che iniziano per `_`
     escluse: durante un refactor è normale averne, e un errore bloccante
     spinge solo a disattivare il lint.
   · Niente regole di formattazione. Il tempo speso a discutere di virgole
     è tempo tolto ai bug veri.

   Le funzioni serverless in api/ girano su Node e non conoscono `window`:
   hanno un blocco proprio con i globali giusti.
══════════════════════════════════════════════════════════════════════════ */

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "public/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },

  /* ── Applicazione: browser ─────────────────────────────────────────── */
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      /* `any` esiste in qualche punto di confine con Supabase, dove la
         risposta è genuinamente dinamica. Avviso, non errore. */
      "@typescript-eslint/no-explicit-any": "warn",
      /* Questo invece è un errore: un `await` dimenticato su una chiamata
         di rete produce un'interfaccia che dichiara «fatto» prima che lo
         sia, ed è il tipo di difetto che il cliente vede per primo. */
      "no-console": ["warn", { allow: ["warn", "error"] }],

      /* Le diagnostiche del React Compiler (plugin v7) fotografano un
         debito reale ma PREESISTENTE: una quarantina di punti in codice
         animato che oggi funziona. Da avviso restano visibili e contate a
         ogni esecuzione; da errore bloccherebbero ogni pubblicazione
         finché non si rifattorizza mezzo portale — cioè insegnerebbero a
         ignorare il cancello. Le regole dei hook classiche
         (rules-of-hooks, exhaustive-deps) restano errori: quelle
         segnalano bug, non stile. */
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
    },
  },

  /* ── Funzioni serverless: Node ─────────────────────────────────────── */
  {
    files: ["api/**/*.{ts,tsx}", "middleware.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  /* ── Test: girano in Node, parlano al browser ──────────────────────── */
  {
    files: ["tests/**/*.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: globals.node },
  },
)
