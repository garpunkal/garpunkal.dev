// @filename: experience.ts
import type { Image } from "./image.ts";
import type { Project } from "./project.ts";

export class Experience {
  id: number;
  title: string;
  job: string;
  location: string;
  logo: Image;
  url: string;
  shortUrl: string;
  from?: Date;
  to?: Date;
  isCurrent: boolean;
  description: string;
  hideDescription: boolean;
  projects: Project[];
  contributions: Project[];
  orderDate?: Date;

  constructor(
    id: number,
    title: string,
    job: string,
    location: string,
    logo: Image,
    url: string,
    shortUrl: string,
    isCurrent: boolean,
    description: string,
    hideDescription: boolean,
    projects: Project[],
    contributions: Project[],
    from?: Date,
    to?: Date,
    orderDate?: Date,
  ) {
    this.id = id;
    this.title = title;
    this.job = job;
    this.location = location;
    this.logo = logo;
    this.url = url;
    this.shortUrl = shortUrl;
    this.from = from;
    this.to = to;
    this.isCurrent = isCurrent;
    this.description = description;
    this.hideDescription = hideDescription;
    this.projects = projects;
    this.contributions = contributions;
    this.orderDate = orderDate;
  }
}
