import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ASSETS_DIR = "C:\\Users\\fadilismee\\Pictures\\Catalog Assets";
const UPLOADS_FILE = "src/data/uploads.json";
const CATBOX_API = "https://catbox.moe/user/api.php";

async function uploadFile(filePath, fileName) {
  const buf = readFileSync(filePath);
  const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append(
    "fileToUpload",
    new Blob([buf], { type: `image/${ext === "jpg" ? "jpeg" : ext}` }),
    fileName,
  );

  let attempts = 0;
  while (attempts < 3) {
    try {
      attempts++;
      const res = await fetch(CATBOX_API, { method: "POST", body: form });
      const text = (await res.text()).trim();
      if (res.ok && text.startsWith("http")) {
        return text;
      }
      console.warn(`[Attempt ${attempts}] Upload failed for ${fileName}:`, text);
    } catch (err) {
      console.warn(`[Attempt ${attempts}] Error for ${fileName}:`, err.message);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`Failed to upload ${fileName} after 3 attempts.`);
}

async function main() {
  const files = readdirSync(ASSETS_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  console.log(`Found ${files.length} images to upload.`);

  let mapping = {};
  const mapFile = "scripts/uploaded-assets-map.json";
  if (existsSync(mapFile)) {
    try {
      mapping = JSON.parse(readFileSync(mapFile, "utf-8"));
    } catch {}
  }

  const newRecords = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (mapping[f]) {
      console.log(`[${i + 1}/${files.length}] Already uploaded: ${f} -> ${mapping[f]}`);
      continue;
    }

    console.log(`[${i + 1}/${files.length}] Uploading: ${f}...`);
    const fullPath = join(ASSETS_DIR, f);
    const url = await uploadFile(fullPath, f);
    console.log(`  -> ${url}`);
    mapping[f] = url;
    newRecords.push({ url, label: f, at: new Date().toISOString() });

    // Save map incrementally
    writeFileSync(mapFile, JSON.stringify(mapping, null, 2), "utf-8");
    await new Promise((r) => setTimeout(r, 600)); // slight pause to be polite to Catbox
  }

  // Update uploads.json
  let existingUploads = [];
  if (existsSync(UPLOADS_FILE)) {
    try {
      existingUploads = JSON.parse(readFileSync(UPLOADS_FILE, "utf-8"));
    } catch {}
  }

  const combined = [...newRecords, ...existingUploads.filter((e) => !mapping[e.label])].slice(
    0,
    250,
  );
  writeFileSync(UPLOADS_FILE, JSON.stringify(combined, null, 2) + "\n", "utf-8");
  console.log(`Done! All ${files.length} files uploaded and mapped.`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
