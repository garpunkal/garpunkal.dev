// @filename: mappers.ts

import { GetDate, GetBool } from "./utils";
import { Project } from "./models/project";
import { Home } from "./models/home";
import { Experience } from "./models/experience";
import { Link } from "./models/link";
import { Image } from "./models/image";
import { Article } from "./models/article";

export function MapArticle(item: any) {
	return new Article(
		item.id,
		item.title,
		item.published_at,
		item.description,
		item.tag_list,
		item.canonical_url,
		item.cover_image,
		item.positive_reactions_count,
		item.comments_count
	);
}

export function MapProject(item: any) {
	return new Project(
		item.data.id,
		item.data.title,
		item.data.position,
		item.data.url,
		new Image(
			"https://cloud.squidex.io/api/assets/garpunkaldev/" + item.data.image + "?cache=31536000",
			"",
			item.data.title,
			""
		),
		item.data.SortOrder ?? 0,
		GetBool(item.data.IsHighlight),
		GetBool(item.data.IsWinner),
		item.data.winnerLabel,
		item.data.winnerDescription,
		item.data.winnerUrl
	);
}

export function MapExperience(item: any, company: any, projects: Project[], contribs: Project[]) {
	return new Experience(
		item.data.id,
		company.data.title,
		item.data.job,
		item.data.location,
		new Image(
			"https://cloud.squidex.io/api/assets/garpunkaldev/" + company.data.logo + "?cache=31536000",
			company.data.logoBackgroundColour,
			company.data.title,
			company.data.logoForegroundColour,
		),
		company.data.url,
		company.data.shortUrl,
		GetBool(item.data.isCurrent),
		item.data.description,
		GetBool(item.data.hideDescription),
		projects,
		contribs,
		GetDate(item.data.from),
		GetDate(item.data.to),
		item.data.from
	);
}

export function MapHome(item: any) {
	return new Home(
		item.id,
		item.data.title,
		item.data.subTitle,
		item.data.githubUrl,
		new Image(
			"https://cloud.squidex.io/api/assets/garpunkaldev/" + item.data.profileImage + "?cache=31536000",
			"",
			item.data.title,
			""
		),
		MapLink(item.data.githubSource),
		item.data.specialisms.map((p: any) => MapLink(p)),
		item.data.socials.map((p: any) => MapLink(p)),
		item.data.footerLinks.map((p: any) => MapLink(p)),
		item.data.projectsLabel,
		item.data.articlesLabel,
		item.data.experiencesLabel,
	);
}


export function MapLink(item: any) {
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
		GetBool(item.displayComponent),
		item.viewBox
	);
}
