// @filename: mappers.ts

import { getDate, getBool } from "./utils.ts";
import { Project } from "./models/project.ts";
import { Home } from "./models/home.ts";
import { Experience } from "./models/experience.ts";
import { Link } from "./models/link.ts";
import { Image } from "./models/image.ts";
import { Article } from "./models/article.ts";
import { Skill } from "./models/skill.ts";
import { SkillGroup } from "./models/skill-group.ts";

export function mapArticle(item: any) {
  return new Article(
    item.id,
    item.title,
    item.published_at,
    item.description,
    item.tag_list,
    item.canonical_url,
    item.cover_image,
    item.positive_reactions_count,
    item.comments_count,
  );
}

export function mapProject(item: any) {
  return new Project(
    item.data.id,
    item.data.title,
    item.data.position,
    item.data.url,
    new Image(
      item.data.image
        ? "https://cloud.squidex.io/api/assets/garpunkaldev/" +
            item.data.image +
            "?cache=31536000"
        : "",
      "",
      item.data.title,
      "",
    ),
    item.data.SortOrder ?? 0,
    getBool(item.data.IsHighlight),
    getBool(item.data.IsWinner),
    item.data.winnerLabel,
    item.data.winnerDescription,
    item.data.winnerUrl,
    item.data.personal ?? false
  );
}

export function mapExperience(
  item: any,
  company: any,
  projects: Project[],
  contribs: Project[],
) {
  return new Experience(
    item.data.id,
    company.data.title,
    item.data.job,
    item.data.location,
    new Image(
      "https://cloud.squidex.io/api/assets/garpunkaldev/" +
        company.data.logo +
        "?cache=31536000",
      company.data.logoBackgroundColour,
      company.data.title,
      company.data.logoForegroundColour,
    ),
    company.data.url,
    company.data.shortUrl,
    getBool(item.data.isCurrent),
    item.data.description,
    getBool(item.data.hideDescription),
    projects,
    contribs,
    getDate(item.data.from),
    getDate(item.data.to),
    item.data.from,
  );
}

export function mapHome(item: any) {
  return new Home(
    item.id,
    item.data.title,
    item.data.subTitle,
    item.data.githubUrl,
    new Image(
      "https://cloud.squidex.io/api/assets/garpunkaldev/" +
        item.data.profileImage +
        "?cache=31536000",
      "",
      item.data.title,
      "",
    ),
    mapLink(item.data.githubSource),
    item.data.specialisms.map((p: any) => mapLink(p)),
    item.data.socials.map((p: any) => mapLink(p)),
    item.data.footerLinks.map((p: any) => mapLink(p)),
    item.data.projectsLabel,
    item.data.articlesLabel,
    item.data.experiencesLabel,
    item.data.personalProjectLabel,
    item.data.skillsLabel
  );
}

export function mapSkillGroup(item: any) {
  return new SkillGroup(
    item.id,
    item.data.title,
    Number(item.data.sortOrder) || 999
  );
}

export function mapSkill(item: any, groupItem?: any) {
  let logoUrl = "";
  if (item.data.logo) {
    const v = item.version ?? 1;
    if (Array.isArray(item.data.logo) && item.data.logo.length > 0) {
      logoUrl = `https://cloud.squidex.io/api/assets/garpunkaldev/${item.data.logo[0]}?v=${v}&cache=31536000`;
    } else if (typeof item.data.logo === "string") {
      if (item.data.logo.startsWith("http") || item.data.logo.startsWith("/")) {
        logoUrl = item.data.logo;
      } else {
        logoUrl = `https://cloud.squidex.io/api/assets/garpunkaldev/${item.data.logo}?v=${v}&cache=31536000`;
      }
    }
  }

  const background = item.data.background || "#1E293B";
  const foreground = item.data.foreground || "#FFFFFF";

  let groupTitle = "";
  let groupOrder = 999;

  if (groupItem && groupItem.data) {
    groupTitle = groupItem.data.title;
    groupOrder = Number(groupItem.data.sortOrder) || 999;
  }

  const group = groupTitle ? [groupTitle] : [];

  return new Skill(
    item.data.id,
    item.data.title,
    item.data.url,
    background,
    foreground,
    group,
    logoUrl,
    groupTitle,
    groupOrder,
  );
}

export function mapLink(item: any) {
  return new Link(
    item.title,
    item.url,
    item.cssClasses,
    item.svgPath,
    item.svgStroke,
    item.svgStrokeWidth,
    item.svgFill,
    item.svgStrokeLineCap,
    item.svgStrokeLineJoin,
    item.rel,
    getBool(item.displayComponent),
    item.viewBox,
  );
}
