// @filename: mappers.ts

import { getDate, getBool } from "./utils.ts";
import { Project } from "./models/project.ts";
import { Home } from "./models/home.ts";
import { Experience } from "./models/experience.ts";
import { Link } from "./models/link.ts";
import { Image } from "./models/image.ts";
import { Article } from "./models/article.ts";

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
      "https://cloud.squidex.io/api/assets/" + import.meta.env.SQUIDEX_KEY + "/" +
      item.data.image +
      "?cache=31536000",
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
      "https://cloud.squidex.io/api/assets/" + import.meta.env.SQUIDEX_KEY + "/" +
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
      "https://cloud.squidex.io/api/assets/" + import.meta.env.SQUIDEX_KEY + "/" +
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
