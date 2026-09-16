/**
 * npm run validate — cek semua file data JSON dengan zod schema.
 * Dijalankan via Node type-stripping (Node >= 22.6), tanpa build step.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateAllData } from "../src/lib/validateAll.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { results, failed } = validateAllData(root);

for (const r of results) {
  console.log(`${r.ok ? "OK  " : "FAIL"} ${r.file}`);
  for (const issue of r.issues) console.log(`  - ${issue}`);
}

process.exit(failed ? 1 : 0);
