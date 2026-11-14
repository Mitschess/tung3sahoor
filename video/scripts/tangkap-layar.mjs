// Mengambil tangkapan layar Rangkul (mode demo, data fiktif) untuk video.
// Jalankan server demo dulu (next dev tanpa variabel Supabase) lalu:
//   node scripts/tangkap-layar.mjs http://localhost:3300
import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const BASIS = process.argv[2] ?? "http://localhost:3300";
const KELUAR = path.resolve("public/layar");
const CHROME = path.resolve(
  "node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe",
);
fs.mkdirSync(KELUAR, { recursive: true });

const IBU = [
  ["ibu-beranda", "/ibu", true],
  ["ibu-pantau", "/ibu/pantau", true],
  ["ibu-fitur", "/ibu/fitur", false],
  ["ibu-jadwal-grafik", "/ibu/hasil", true],
  ["ibu-tanda-bahaya", "/ibu/tanda-bahaya", true],
  ["ibu-catatan", "/ibu/catatan", true],
  ["ibu-persiapan", "/ibu/persiapan", true],
  ["ibu-edukasi", "/ibu/edukasi", true],
  ["ibu-edukasi-sampul", "/ibu/edukasi/t3", false],
];

const NAKES = [
  ["nakes-beranda", "/app", false],
  ["nakes-daftar-ibu", "/app/ibu", true],
  ["nakes-detail-siti", "/app/ibu/i_siti", true],
  ["nakes-detail-rahma", "/app/ibu/i_rahma", true],
  ["nakes-foto", "/app/foto", true],
  ["nakes-pengingat", "/app/pengingat", true],
  ["nakes-daftar-baru", "/app/daftar", true],
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars"] });
const page = await browser.newPage();

async function masukSebagai(id) {
  await page.goto(`${BASIS}/masuk`, { waitUntil: "networkidle0" });
  await page.evaluate((pid) => {
    const o = JSON.parse(localStorage.getItem("momcare-demo"));
    o.state.penggunaId = pid;
    o.state.setujuPrivasi = true;
    localStorage.setItem("momcare-demo", JSON.stringify(o));
  }, id);
}

async function potret(nama, url, penuh) {
  await page.goto(`${BASIS}${url}`, { waitUntil: "networkidle0" });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important} *{caret-color:transparent}" });
  await new Promise((r) => setTimeout(r, 1200));
  const file = path.join(KELUAR, `${nama}.jpg`);
  if (penuh) {
    // Menu bawah (fixed) disimpan terpisah lalu disembunyikan, supaya tidak "melayang" di tengah saat halaman digulir di video.
    const nav = await page.evaluate(() => {
      const el = [...document.querySelectorAll("body *")].find((e) => {
        const cs = getComputedStyle(e);
        const r = e.getBoundingClientRect();
        return cs.position === "fixed" && r.bottom >= innerHeight - 2 && r.height > 40 && r.height < 140 && r.width > innerWidth * 0.8;
      });
      if (!el) return null;
      const r = el.getBoundingClientRect();
      el.setAttribute("data-nav-video", "");
      return { x: 0, y: r.top, width: innerWidth, height: innerHeight - r.top };
    });
    if (nav) {
      await page.screenshot({ path: path.join(KELUAR, `${nama}-nav.jpg`), type: "jpeg", quality: 92, clip: nav });
      await page.addStyleTag({ content: "[data-nav-video]{display:none!important}" });
      console.log("  menu bawah", Math.round(nav.height), "px");
    }
  }
  await page.screenshot({ path: file, type: "jpeg", quality: 92, fullPage: penuh });
  console.log("✓", nama, page.url());
}

await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await masukSebagai("u_ibu_siti");
for (const [n, u, p] of IBU) await potret(n, u, p);

// Buku edukasi: balik ke lembar 2 dan 3.
await page.goto(`${BASIS}/ibu/edukasi/t3`, { waitUntil: "networkidle0" });
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
for (const lembar of [2, 3]) {
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /Buka|Lanjut/.test(b.textContent))?.click());
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(KELUAR, `ibu-edukasi-isi${lembar}.jpg`), type: "jpeg", quality: 92 });
  console.log("✓ edukasi lembar", lembar);
}

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5, isMobile: false, hasTouch: false });
await masukSebagai("u_bidan");
for (const [n, u, p] of NAKES) await potret(n, u, p);

await browser.close();
