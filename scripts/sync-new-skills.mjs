// scripts/sync-new-skills.mjs
import fs from "fs";
import path from "path";
import * as simpleIcons from "simple-icons";
import KNOWN_URLS from "./data/known-urls.json" with { type: "json" };
import KNOWN_COLORS from "./data/known-colors.json" with { type: "json" };
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
const GEMINI_API_KEY = env.GEMINI_API_KEY;
const SKILL_GROUPS = [
  "Architecture & Backend",
  "CMS & Content Platforms",
  "Frontend & UI",
  "Cloud, DevOps & Tooling",
  "AI & Emerging Tech",
];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Error: Missing SQUIDEX_CLIENT_ID or SQUIDEX_CLIENT_SECRET in .env");
  console.error("Please ensure your .env file contains:");
  console.error("  SQUIDEX_KEY=garpunkaldev");
  console.error("  SQUIDEX_CLIENT_ID=garpunkaldev:powershell");
  console.error("  SQUIDEX_CLIENT_SECRET=your_secret_here\n");
  process.exit(1);
}

/**
 * Determine best group category for a skill
 */
function inferGroup(title) {
  const t = title.toLowerCase();

  // CMS & content platforms
  if (
    t.includes("cms") ||
    ["umbraco", "sitecore", "sitefinity", "squidex", "wordpress", "strapi", "sanity", "contentful", "drupal", "power pages", "usync", "headless", "jamstack", "ecommerce"].some(k => t.includes(k))
  ) {
    return "CMS & Content Platforms";
  }

  // AI
  if (
    /\bai\b/.test(t) ||
    t.includes("llm") ||
    ["gemini", "claude", "copilot", "ollama", "gpt", "openai", "anthropic", "langchain", "llama", "deepseek"].some(k => t.includes(k))
  ) {
    return "AI & Emerging Tech";
  }

  // Cloud, DevOps & Tooling
  if (
    [
      "azure", "aws", "gcp", "cloud", "docker", "kubernetes", "k8s", "helm", "k9s", "terraform", "vercel", "netlify",
      "serverless", "devops", "pipeline", "octopus", "dns", "entra", "iis", "git", "jira", "teams", "slack", "figma",
      "powershell", "hyper-v", "storage explorer", "tool", "studio", "vscode", "visual studio", "ide", "editor",
      "postman", "bruno", "insomnia", "jetbrains", "rider", "antigravity", "sql server management studio", "playwright",
      "browserstack", "kibana", "lighthouse", "office", "visio", "markdown", "dotpeek", "dependabot", "keepass",
      "ssl", "let's encrypt", "oauth", "jwt", "content security policies", "owasp"
    ].some(k => t.includes(k))
  ) {
    return "Cloud, DevOps & Tooling";
  }

  // Frontend & UI
  if (
    ["frontend", "html", "css", "javascript", "typescript", "react", "vue", "angular", "svelte", "astro", "tailwind", "sass", "bootstrap", "vite", "webpack", "storybook", "ui", "accessibility"].some(k => t.includes(k))
  ) {
    return "Frontend & UI";
  }

  return "Architecture & Backend";
}

/**
 * Determine contrast color (black or white)
 */
function getContrastColor(hex) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#FFFFFF";
}

/**
 * Fallback brand color generator from string hash
 */
function hashToHex(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  // Convert HSL to Hex (saturation 65%, lightness 42%)
  const s = 0.65;
  const l = 0.42;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Acquire Squidex OAuth token
 */
async function getToken() {
  const res = await fetch("https://cloud.squidex.io/identity-server/connect/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
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
 * Validate that a URL is a valid, canonical external documentation/product link.
 * Disallow Google Search, Wikipedia, Wikimedia, etc.
 */
function isValidSkillUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;
  if (
    trimmed.includes("google.com/search") ||
    trimmed.includes("bing.com/search") ||
    trimmed.includes("wikipedia.org") ||
    trimmed.includes("wikimedia.org") ||
    trimmed.includes("/wiki/")
  ) {
    return false;
  }
  return true;
}

function isBadUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.includes("google.com/search") ||
    trimmed.includes("bing.com/search") ||
    trimmed.includes("wikipedia.org") ||
    trimmed.includes("wikimedia.org") ||
    trimmed.includes("/wiki/")
  );
}

/**
 * Ask Google Gemini to provide canonical metadata for a skill
 */
async function queryGeminiForSkill(title, availableGroups = []) {
  if (!GEMINI_API_KEY) return null;

  const prompt = `You are an expert developer portfolio assistant. Given the technology, tool, pattern, or skill name "${title}", provide its canonical metadata.
Available skill categories to choose from: ${JSON.stringify(availableGroups)}.

Respond ONLY with a valid JSON object matching this schema without any markdown formatting or code blocks:
{
  "url": "canonical official product, tool, or vendor documentation URL (e.g. https://...). NEVER return a Wikipedia, Wikimedia, or Google search URL. If there is no official dedicated product or vendor website, return empty string \"\"",
  "background": "official brand HEX color (e.g. #0078D4) or high quality primary brand color",
  "foreground": "#FFFFFF or #000000 based on contrast against the background",
  "group": "most appropriate category selected exactly from the available skill categories list",
  "iconSlug": "best matching brand slug from simpleicons.org (Simple Icons) or devicon (lowercase alphanumeric, e.g. 'csharp', 'azure', 'dotnet', 'googlemaps', 'keepassxc', 'slack', 'jira', 'docker')",
  "searchKeywords": ["alternative_slug1", "alternative_slug2"]
}`;

  const models = ["gemini-3.8-flash", "gemini-flash-latest"];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.1,
            },
          }),
          signal: AbortSignal.timeout(10000),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return parsed;
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Fetch vector SVG icon for a skill title, searching simpleicons.org first, then Devicon & remote CDNs
 */
async function fetchIconSvg(title, aiData = null) {
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");
  const hyphenTitle = title.toLowerCase().replace(/\s+/g, "-");
  const alias = ICON_ALIASES[cleanTitle] || ICON_ALIASES[hyphenTitle];

  const aiSlug = aiData?.iconSlug ? aiData.iconSlug.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
  const aiKeywords = Array.isArray(aiData?.searchKeywords)
    ? aiData.searchKeywords.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, "")).filter(Boolean)
    : [];

  const candidates = [
    aiSlug,
    alias,
    cleanTitle,
    hyphenTitle,
    ...aiKeywords,
  ].filter(Boolean);

  const uniqueCandidates = [...new Set(candidates)];

  // 1. Search simpleicons.org (Simple Icons) library (3,460+ brand icons in package)
  for (const slug of uniqueCandidates) {
    const icon = SIMPLE_ICONS_BY_SLUG.get(slug) || SIMPLE_ICONS_BY_TITLE.get(slug);
    if (icon?.svg) {
      return {
        svg: sanitizeSvg(icon.svg, "#FFFFFF"),
        slug: icon.slug,
        hex: icon.hex ? `#${icon.hex}` : null,
        title: icon.title,
        source: "simpleicons.org",
      };
    }
  }

  // 2. Query remote simpleicons.org CDN & fallbacks
  for (const slug of uniqueCandidates) {
    const urls = [
      `https://cdn.simpleicons.org/${slug}`,
      `https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/${slug}.svg`,
      `https://unpkg.com/simple-icons/icons/${slug}.svg`,
      `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`,
      `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`,
      `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-plain.svg`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const svgText = await res.text();
          if (svgText.includes("<svg") && (svgText.includes("path") || svgText.includes("polygon"))) {
            return {
              svg: sanitizeSvg(svgText, "#FFFFFF"),
              slug,
              source: url.includes("simpleicons") || url.includes("simple-icons") ? "simpleicons.org" : "devicon",
            };
          }
        }
      } catch {}
    }
  }

  return null;
}

async function main() {
  console.log("=================================================");
  console.log("  Squidex Skill Auto-Enrichment & Icon Sync");
  console.log("=================================================");

  console.log(`Authenticating with Squidex [${APP_NAME}]...`);
  const token = await getToken();
  console.log("Authentication successful.\n");

  // 1. Locate or create 'icons' folder
  const foldersRes = await fetch(`https://cloud.squidex.io/api/apps/${APP_NAME}/assets/folders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const foldersData = await foldersRes.json();
  let iconsFolder = (foldersData.items || []).find(f => f.folderName.toLowerCase() === "icons");

  if (!iconsFolder) {
    console.log("Creating 'icons' folder in Squidex Assets...");
    const createFolderRes = await fetch(`https://cloud.squidex.io/api/apps/${APP_NAME}/assets/folders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ folderName: "icons" }),
    });
    iconsFolder = await createFolderRes.json();
  }
  const iconsFolderId = iconsFolder.id;
  console.log(`Icons folder active (ID: ${iconsFolderId}).`);

  // 2. Fetch existing assets to avoid re-uploading duplicate icons
  console.log("Indexing existing assets in Squidex...");
  const assetsRes = await fetch(`https://cloud.squidex.io/api/apps/${APP_NAME}/assets?$top=500`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const assetsData = await assetsRes.json();
  const assetMap = new Map(); // filename.toLowerCase() -> assetId
  for (const a of assetsData.items || []) {
    assetMap.set(a.fileName.toLowerCase(), a.id);
  }
  console.log(`Indexed ${assetMap.size} existing assets.`);

  // 3. Fetch skill groups
  console.log("Fetching skill groups from Squidex...");
  const groupsRes = await fetch(`https://cloud.squidex.io/api/content/${APP_NAME}/skillgroup?$top=100`, {
    headers: { Authorization: `Bearer ${token}`, "X-Flatten": "true" },
  });
  const groupsData = await groupsRes.json();
  const skillGroupMap = new Map();
  for (const g of groupsData.items || []) {
    skillGroupMap.set((g.data.title || "").trim().toLowerCase(), g.id);
  }
  console.log(`Indexed ${skillGroupMap.size} skill groups.`);

  // 4. Fetch all skills (including unpublished/drafts)
  console.log("\nFetching skills from Squidex...");
  const skillsRes = await fetch(`https://cloud.squidex.io/api/content/${APP_NAME}/skill?$top=500`, {
    headers: { Authorization: `Bearer ${token}`, "X-Flatten": "true", "X-Unpublished": "true" },
  });
  const skillsData = await skillsRes.json();
  const skills = skillsData.items || [];
  console.log(`Found ${skills.length} skills in total.\n`);

  const args = process.argv.slice(2);
  const forceAll = args.includes("--all") || args.includes("--force");
  const skillFlagIdx = args.indexOf("--skill");
  const targetSkillName = skillFlagIdx !== -1 && args[skillFlagIdx + 1]
    ? args[skillFlagIdx + 1].toLowerCase()
    : (!args[0]?.startsWith("--") && args[0] ? args[0].toLowerCase() : null);

  // 5. Identify skills needing enrichment
  const incompleteSkills = [];
  for (const skill of skills) {
    const d = skill.data;
    const title = (d.title || "").trim();
    if (!title) continue;

    if (targetSkillName && !title.toLowerCase().includes(targetSkillName)) {
      continue;
    }

    const needsLogo = forceAll || !d.logo || (Array.isArray(d.logo) && d.logo.length === 0);
    const needsUrl = forceAll || d.url === undefined || isBadUrl(d.url);
    const needsBg = forceAll || !d.background || d.background.trim() === "";
    const needsFg = forceAll || !d.foreground || d.foreground.trim() === "";
    const needsGroup = forceAll || !d.group || (Array.isArray(d.group) && d.group.length === 0);

    if (needsLogo || needsUrl || needsBg || needsFg || needsGroup) {
      incompleteSkills.push({
        skill,
        title,
        id: skill.id,
        needs: { needsLogo, needsUrl, needsBg, needsFg, needsGroup },
      });
    }
  }

  if (incompleteSkills.length === 0) {
    console.log("✅ All skills are already 100% complete with logo, url, colors, and group!");
    console.log("Tip: Run with '--all' or '--skill <name>' to re-evaluate with Google Gemini and simpleicons.org.");
    return;
  }

  const availableGroupTitles = SKILL_GROUPS.filter(title => skillGroupMap.has(title.toLowerCase()));

  if (GEMINI_API_KEY) {
    console.log("🤖 Gemini AI Mode Active: Canonical URLs, colors, groups, and simpleicons.org slugs will be determined via AI.\n");
  } else {
    console.log("ℹ️ Algorithmic Mode Active (Add GEMINI_API_KEY to .env to enable AI-powered metadata lookup).\n");
  }

  console.log(`Found ${incompleteSkills.length} skill(s) requiring enrichment:`);
  for (const item of incompleteSkills) {
    const missing = Object.entries(item.needs).filter(([, v]) => v).map(([k]) => k.replace("needs", "").toLowerCase());
    console.log(` • "${item.title}" -> missing: [${missing.join(", ")}]`);
  }
  console.log("");

  // 6. Enrich each skill
  let updatedCount = 0;

  for (const item of incompleteSkills) {
    const { skill, title, id, needs } = item;
    const key = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    console.log(`-------------------------------------------------`);
    console.log(`Enriching: "${title}"...`);

    let aiData = null;
    if (GEMINI_API_KEY) {
      console.log(`  🤖 Asking Google Gemini for "${title}" metadata (URL, simpleicons.org slug, background, fore colour)...`);
      aiData = await queryGeminiForSkill(title, availableGroupTitles);
      if (aiData) {
        console.log(`  🤖 Gemini AI suggested:`, JSON.stringify(aiData));
      }
    }

    const patchBody = {};

    // Group
    if (needs.needsGroup) {
      let targetGroupId = null;
      let assignedGroupName = "";

      if (aiData?.group && SKILL_GROUPS.some(group => group.toLowerCase() === aiData.group.toLowerCase())) {
        const found = groupsData.items?.find(g => (g.data.title || "").toLowerCase() === aiData.group.toLowerCase());
        if (found) {
          targetGroupId = found.id;
          assignedGroupName = found.data.title;
        }
      }

      if (!targetGroupId) {
        const groupKey = inferGroup(title);
        targetGroupId = skillGroupMap.get(groupKey.toLowerCase());
        assignedGroupName = groupKey;
      }

      if (!targetGroupId) {
        throw new Error(`No Squidex skill group exists for "${assignedGroupName || inferGroup(title)}".`);
      }

      patchBody.group = { iv: [targetGroupId] };
      console.log(`  + Assigned Group: "${assignedGroupName}" (${targetGroupId})`);
    }

    // URL (via Google Gemini)
    if (needs.needsUrl) {
      const candidateUrl = (aiData?.url || KNOWN_URLS[key] || "").trim();
      if (isValidSkillUrl(candidateUrl)) {
        patchBody.url = { iv: candidateUrl };
        console.log(`  + Assigned Official URL: ${candidateUrl}`);
      } else {
        patchBody.url = { iv: "" };
        console.log(`  + No canonical official URL found (Wikipedia/Google avoided); left blank.`);
      }
    }

    // Logo & Icon (via Google Gemini slug ➔ simpleicons.org)
    let fetched = null;
    let assetId = null;

    if (needs.needsLogo) {
      const hyphenKey = title.toLowerCase().replace(/\s+/g, "-");
      const aliasKey = ICON_ALIASES[key] || ICON_ALIASES[hyphenKey];
      const aiSlug = aiData?.iconSlug ? aiData.iconSlug.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      const candidateSlugs = [aiSlug, key, hyphenKey, aliasKey].filter(Boolean);

      // Check existing Squidex assets first
      for (const slug of candidateSlugs) {
        if (assetMap.has(`${slug}.svg`)) {
          assetId = assetMap.get(`${slug}.svg`);
          console.log(`  + Found existing Squidex asset: ${slug}.svg (${assetId})`);
          break;
        } else if (assetMap.has(`${slug}.png`)) {
          assetId = assetMap.get(`${slug}.png`);
          console.log(`  + Found existing Squidex asset: ${slug}.png (${assetId})`);
          break;
        }
      }

      // If not in Squidex, resolve clean vector icon from simpleicons.org
      if (!assetId) {
        console.log(`  + Searching simpleicons.org for "${title}" icon...`);
        fetched = await fetchIconSvg(title, aiData);
        if (fetched) {
          const uploadFileName = `${fetched.slug}.svg`;
          const fileBuffer = Buffer.from(fetched.svg, "utf-8");
          const mimeType = "image/svg+xml";
          console.log(`  + Resolved icon "${uploadFileName}" from ${fetched.source || "simpleicons.org"}`);

          try {
            const formData = new FormData();
            formData.append("file", new Blob([fileBuffer], { type: mimeType }), uploadFileName);
            formData.append("parentId", iconsFolderId);

            const uploadRes = await fetch(`https://cloud.squidex.io/api/apps/${APP_NAME}/assets?parentId=${iconsFolderId}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });

            if (uploadRes.ok) {
              const assetData = await uploadRes.json();
              assetId = assetData.id;
              assetMap.set(uploadFileName.toLowerCase(), assetId);
              console.log(`  + Uploaded ${uploadFileName} to Squidex icons folder (${assetId})`);
            } else {
              console.error(`  ⚠️ Asset upload error (${uploadRes.status}):`, await uploadRes.text());
            }
          } catch (uploadErr) {
            console.error(`  ⚠️ Upload failed:`, uploadErr.message);
          }
        }
      }

      if (assetId) {
        patchBody.logo = { iv: [assetId] };
        console.log(`  + Linked logo asset: ${assetId}`);
      } else {
        console.warn(`  ⚠️ Could not find or download icon for "${title}".`);
      }
    }

    // Colors: Background & Fore colour (using SimpleIcons hex or Gemini hex, and computed contrast)
    let finalBg = skill.data.background;
    let finalFg = skill.data.foreground;

    if (needs.needsBg) {
      finalBg = (fetched?.hex && /^#[0-9A-Fa-f]{6}$/.test(fetched.hex))
        ? fetched.hex.toUpperCase()
        : ((aiData?.background && /^#[0-9A-Fa-f]{6}$/.test(aiData.background))
          ? aiData.background.toUpperCase()
          : (KNOWN_COLORS[key]?.bg || hashToHex(title)));
      patchBody.background = { iv: finalBg };
      console.log(`  + Assigned Background: ${finalBg}`);
    }

    if (needs.needsFg) {
      finalFg = (aiData?.foreground && /^#[0-9A-Fa-f]{6}$/.test(aiData.foreground))
        ? aiData.foreground.toUpperCase()
        : getContrastColor(finalBg || "#1E293B");
      patchBody.foreground = { iv: finalFg };
      console.log(`  + Assigned Fore colour: ${finalFg}`);
    }

    // Submit PATCH to Squidex
    if (Object.keys(patchBody).length > 0) {
      try {
        const patchRes = await fetch(`https://cloud.squidex.io/api/content/${APP_NAME}/skill/${id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patchBody),
        });

        if (patchRes.ok) {
          console.log(`  ✅ Successfully updated "${title}" in Squidex!`);
          updatedCount++;
        } else {
          console.error(`  ❌ Update failed (${patchRes.status}):`, await patchRes.text());
        }
      } catch (err) {
        console.error(`  ❌ Update failed:`, err.message);
      }
    }

    // Pacing delay
    await new Promise(r => setTimeout(r, 60));
  }

  console.log(`\n=================================================`);
  console.log(`  Completed! Successfully enriched ${updatedCount} skill(s).`);
  console.log(`=================================================`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
