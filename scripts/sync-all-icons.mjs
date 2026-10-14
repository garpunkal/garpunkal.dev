// scripts/sync-all-icons.mjs
import fs from "fs";
import path from "path";
import * as simpleIcons from "simple-icons";
import ICON_ALIASES from "./data/icon-aliases.json" with { type: "json" };

// Index all simpleicons.org (Simple Icons) brands by slug and normalized title for instant lookups
const SIMPLE_ICONS_BY_SLUG = new Map();
const SIMPLE_ICONS_BY_TITLE = new Map();

for (const [key, icon] of Object.entries(simpleIcons)) {
  if (icon && typeof icon === "object" && icon.slug) {
    SIMPLE_ICONS_BY_SLUG.set(icon.slug.toLowerCase(), icon);
    const normTitle = icon.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normTitle && !SIMPLE_ICONS_BY_TITLE.has(normTitle)) {
      SIMPLE_ICONS_BY_TITLE.set(normTitle, icon);
    }
  }
}

/**
 * Load environment variables from .env file
 */
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };
const APP_NAME = env.SQUIDEX_KEY || env.SQUIDEX_APP_NAME || "garpunkaldev";
const CLIENT_ID = env.SQUIDEX_CLIENT_ID;
const CLIENT_SECRET = env.SQUIDEX_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Error: Missing SQUIDEX_CLIENT_ID or SQUIDEX_CLIENT_SECRET in .env");
  process.exit(1);
}

/**
 * Authenticate with Squidex and return Bearer token
 */
async function getSquidexToken() {
  const res = await fetch("https://cloud.squidex.io/identity-server/connect/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "squidex-api",
    }),
  });
  if (!res.ok) throw new Error(`Squidex authentication failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

/**
 * Sanitize SVG for Squidex's strict XML sanitizer
 */
function sanitizeSvg(rawSvg, fillColor = "#FFFFFF") {
  return rawSvg
    .replace(/<\?xml[^>]*\?>/gi, "")
    .replace(/<!--[\s\S]*?-->/gi, "")
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<desc>[\s\S]*?<\/desc>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/ role=["'][^"']*["']/gi, "")
    .replace(/ xmlns:xlink=["'][^"']*["']/gi, "")
    .replace(/<svg\b([^>]*)>/i, (match, attrs) => {
      let cleanedAttrs = attrs
        .replace(/\bxmlns=["'][^"']*["']/gi, "")
        .replace(/\bfill=["'][^"']*["']/gi, "")
        .trim();
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="${fillColor}" ${cleanedAttrs}>`;
    })
    .trim();
}

/**
 * Resolve SVG for a given slug from simpleicons.org (in-memory first, then fast CDN)
 */
async function resolveIconSvg(slug) {
  // 1. In-memory simple-icons lookup (instantaneous, 3,460+ brand icons)
  const local = SIMPLE_ICONS_BY_SLUG.get(slug) || SIMPLE_ICONS_BY_TITLE.get(slug);
  if (local?.svg) {
    return {
      svg: sanitizeSvg(local.svg, "#FFFFFF"),
      slug: local.slug,
      source: "simpleicons.org (library)",
      title: local.title,
    };
  }

  // 2. Fast remote CDN lookup
  try {
    const res = await fetch(`https://cdn.simpleicons.org/${slug}`, { signal: AbortSignal.timeout(1000) });
    if (res.ok) {
      const svgText = await res.text();
      if (svgText.includes("<svg") && (svgText.includes("path") || svgText.includes("polygon"))) {
        return {
          svg: sanitizeSvg(svgText, "#FFFFFF"),
          slug,
          source: "simpleicons.org (CDN)",
          title: slug,
        };
      }
    }
  } catch {}

  return null;
}

async function main() {
  console.log("=================================================");
  console.log("  Squidex: SimpleIcons.org Icon Sync & Upgrade");
  console.log("=================================================");

  const token = await getSquidexToken();
  console.log(`Authenticated with Squidex [${APP_NAME}].`);

  // 1. Locate or create 'icons' folder
  const foldersRes = await fetch(`https://cloud.squidex.io/api/apps/${APP_NAME}/assets/folders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const foldersData = await foldersRes.json();
  let iconsFolder = (foldersData.items || []).find(f => f.folderName.toLowerCase() === "icons");
  const iconsFolderId = iconsFolder ? iconsFolder.id : "00000000-0000-0000-0000-000000000000";

  // 2. Fetch existing assets to avoid duplicates
  let allAssets = [];
  let assetSkip = 0;
  while (true) {
    const res = await fetch(`https://cloud.squidex.io/api/apps/${APP_NAME}/assets?$top=200&$skip=${assetSkip}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const items = data.items || [];
    allAssets.push(...items);
    if (items.length < 200) break;
    assetSkip += 200;
  }

  const assetMap = new Map(); // lowercase filename -> asset ID
  const assetById = new Map();
  for (const a of allAssets) {
    assetMap.set(a.fileName.toLowerCase(), a.id);
    assetById.set(a.id, a);
  }
  console.log(`Indexed ${assetMap.size} existing assets in Squidex.`);

  // 3. Fetch all skills
  const skillsRes = await fetch(`https://cloud.squidex.io/api/content/${APP_NAME}/skill?$top=300`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const skillsData = await skillsRes.json();
  const skills = skillsData.items || [];
  console.log(`Fetched ${skills.length} skills from Squidex.\n`);

  let upgradedCount = 0;

  for (const skill of skills) {
    const title = skill.data?.title?.iv || "";
    if (!title || title === "C#") continue;

    const clean = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const hyphen = title.toLowerCase().replace(/\s+/g, "-");
    const alias = ICON_ALIASES[clean] || ICON_ALIASES[hyphen];

    const currentLogoId = skill.data?.logo?.iv?.[0];
    const currentAsset = assetById.get(currentLogoId);
    const currentFileName = currentAsset?.fileName?.toLowerCase() || "";

    const candidateSlugs = [alias, clean, hyphen].filter(Boolean);
    let resolved = null;

    for (const slug of candidateSlugs) {
      if (title === "C#" && slug === "c") continue;
      resolved = await resolveIconSvg(slug);
      if (resolved) break;
    }

    if (!resolved) continue;

    const targetFileName = `${resolved.slug}.svg`.toLowerCase();

    // Check if the skill already has this exact file linked
    if (currentFileName === targetFileName) {
      continue;
    }

    console.log(`Skill "${title}": currently '${currentFileName || "none"}' -> upgrading to simpleicons.org '${targetFileName}'...`);

    // Ensure asset is uploaded to Squidex
    let assetId = assetMap.get(targetFileName);
    if (!assetId) {
      console.log(`  + Uploading new icon "${targetFileName}" to Squidex 'icons' folder...`);
      const fileBuffer = Buffer.from(resolved.svg, "utf-8");
      const formData = new FormData();
      formData.append("file", new Blob([fileBuffer], { type: "image/svg+xml" }), targetFileName);
      formData.append("parentId", iconsFolderId);

      const uploadRes = await fetch(`https://cloud.squidex.io/api/apps/${APP_NAME}/assets?parentId=${iconsFolderId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (uploadRes.ok) {
        const assetData = await uploadRes.json();
        assetId = assetData.id;
        assetMap.set(targetFileName, assetId);
        console.log(`  + Uploaded ${targetFileName} (${assetId})`);
      } else {
        console.error(`  ⚠️ Upload failed (${uploadRes.status}):`, await uploadRes.text());
        continue;
      }
    } else {
      console.log(`  + Reusing existing Squidex asset for "${targetFileName}" (${assetId})`);
    }

    // Patch the skill in Squidex
    const patchRes = await fetch(`https://cloud.squidex.io/api/content/${APP_NAME}/skill/${skill.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        logo: { iv: [assetId] },
      }),
    });

    if (patchRes.ok) {
      upgradedCount++;
      console.log(`  ✅ Successfully updated "${title}" logo in Squidex.\n`);
    } else {
      console.error(`  ⚠️ Failed to update skill "${title}" (${patchRes.status}):`, await patchRes.text(), "\n");
    }
  }

  console.log("=================================================");
  console.log(`Icon sync complete! Upgraded ${upgradedCount} skill icon(s).`);
  console.log("=================================================");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
