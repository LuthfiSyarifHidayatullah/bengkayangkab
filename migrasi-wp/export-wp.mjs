// Ekspor seluruh konten WordPress via REST API + unduh file media.
// Jalankan: node export-wp.mjs   (butuh Node.js 18+)
// Bisa dihentikan lalu dijalankan ulang; file media yang sudah ada dilewati.

import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";

const BASE = (process.env.WP_URL || "https://bengkayangkab.go.id").replace(/\/$/, "");
const OUT = process.env.OUT_DIR || "./export";
const PER_PAGE = 100;
const UA = "Mozilla/5.0 (migrasi-wp)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, tries = 4) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { data: await res.json(), headers: res.headers };
    } catch (e) {
      if (i === tries) throw new Error(`${url} gagal: ${e.message}`);
      await sleep(1000 * i);
    }
  }
}

async function fetchAll(restPath) {
  const items = [];
  let page = 1, totalPages = 1;
  do {
    const sep = restPath.includes("?") ? "&" : "?";
    const url = `${BASE}/wp-json/wp/v2/${restPath}${sep}per_page=${PER_PAGE}&page=${page}`;
    try {
      const { data, headers } = await getJson(url);
      totalPages = Number(headers.get("x-wp-totalpages") || 1);
      items.push(...data);
    } catch (e) {
      if (page > 1) break; // halaman melebihi batas
      throw e;
    }
    process.stdout.write(`\r${restPath}: halaman ${page}/${totalPages}, ${items.length} item   `);
    page++;
    await sleep(300); // jangan membebani server
  } while (page <= totalPages);
  process.stdout.write("\n");
  return items;
}

async function save(name, data) {
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, name), JSON.stringify(data, null, 2));
}

const exists = (p) => access(p).then(() => true, () => false);

async function downloadFile(url, dest) {
  if (await exists(dest)) return "skip";
  for (let i = 1; i <= 3; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, Buffer.from(await res.arrayBuffer()));
      return "ok";
    } catch (e) {
      if (i === 3) return `gagal: ${e.message}`;
      await sleep(1000 * i);
    }
  }
}

async function main() {
  console.log(`Sumber: ${BASE}\n`);

  // Tipe konten bawaan + custom post type
  const { data: types } = await getJson(`${BASE}/wp-json/wp/v2/types`);
  const skip = new Set(["attachment", "nav_menu_item", "wp_block", "wp_template", "wp_template_part", "wp_navigation", "wp_global_styles", "wp_font_family", "wp_font_face"]);
  const contentTypes = Object.values(types).filter((t) => !skip.has(t.slug) && t.rest_base);
  console.log("Tipe konten:", contentTypes.map((t) => `${t.slug} (${t.rest_base})`).join(", "), "\n");
  await save("types.json", types);

  for (const t of contentTypes) {
    await save(`${t.rest_base}.json`, await fetchAll(t.rest_base));
  }

  for (const tax of ["categories", "tags"]) {
    await save(`${tax}.json`, await fetchAll(tax));
  }

  // users hanya mengembalikan penulis publik; bisa gagal jika diblokir
  try { await save("users.json", await fetchAll("users")); } catch (e) { console.warn("users dilewati:", e.message); }

  const media = await fetchAll("media");
  await save("media.json", media);

  if (process.env.SKIP_MEDIA === "1") {
    console.log("\nSKIP_MEDIA=1: file media tidak diunduh (hanya daftar di media.json).");
    console.log(`Selesai. Hasil ada di ${OUT}/`);
    return;
  }

  // Unduh file media (termasuk ukuran asli) dengan mempertahankan path uploads
  console.log("\nMengunduh media...");
  const failed = [];
  let n = 0;
  for (const m of media) {
    n++;
    const url = m.source_url;
    if (!url) continue;
    const path = decodeURIComponent(new URL(url).pathname).replace(/^\/wp-content\/uploads\//, "");
    const r = await downloadFile(url, join(OUT, "uploads", path));
    if (r.startsWith("gagal")) failed.push({ id: m.id, url, error: r });
    process.stdout.write(`\r${n}/${media.length}  gagal: ${failed.length}   `);
    await sleep(100);
  }
  process.stdout.write("\n");
  await save("media-gagal.json", failed);

  console.log(`\nSelesai. Hasil ada di ${OUT}/ (gagal unduh: ${failed.length})`);
}

main().catch((e) => { console.error("\nError:", e.message); process.exit(1); });
