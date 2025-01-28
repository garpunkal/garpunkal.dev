// @filename: home.ts
import type { Image } from "./image.ts";
import type { Link } from "./link.ts";

export class Home {
  id: number;
  title: string;
  subTitle: string;
  githubUrl: string;
  image: Image;
  githubSource: Link;
  specialisms: Link[];
  socials: Link[];
  footerLinks: Link[];
  projectsLabel: string;
  articlesLabel: string;
  experiencesLabel: string;

  constructor(
    id: number,
    title: string,
    subTitle: string,
    githubUrl: string,
    image: Image,
    githubSource: Link,
    specialisms: Link[],
    socials: Link[],
    footerLinks: Link[],
    projectsLabel: string,
    articlesLabel: string,
    experiencesLabel: string,
  ) {
    this.id = id;
    this.title = title;
    this.subTitle = subTitle;
    this.githubUrl = githubUrl;
    this.image = image;
    this.githubSource = githubSource;
    this.specialisms = specialisms;
    this.socials = socials;
    this.footerLinks = footerLinks;
    this.projectsLabel = projectsLabel;
    this.articlesLabel = articlesLabel;
    this.experiencesLabel = experiencesLabel;
  }
}
