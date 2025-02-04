// @filename: squidex.ts
import { dynamicSortMultiple, buildList } from "./utils.ts";
import { mapExperience, mapProject, mapHome } from "./mapper.ts";
import { Project } from "./models/project.ts";
import { Experience } from "./models/experience.ts";

const squidexUrl = "https://cloud.squidex.io/api/content/" + import.meta.env.SQUIDEX_KEY + "/";

let squidexHeaders = new Headers();
squidexHeaders.append("X-Flatten", "true");
squidexHeaders.append("X-NoResolveLanguages", "1");
squidexHeaders.append("X-Languages", "en");
squidexHeaders.append("timeout", "1000");
squidexHeaders.append("retry", "3");
squidexHeaders.append("retryDelay", "4000");

export async function getExperiences() {
  try {
    const experienceData = await fetch(squidexUrl + "experience", {
      headers: squidexHeaders,
    });
    const experienceJson = await experienceData.json();

    const companyData = await fetch(squidexUrl + "company", {
      headers: squidexHeaders,
    });
    const companyJson = await companyData.json();

    const projectData = await fetch(squidexUrl + "project", {
      headers: squidexHeaders,
    });
    const projectJson = await projectData.json();

    const experiences: Experience[] = [];

    for (const item of experienceJson.items) {
      const company = companyJson.items.find(function (x: { id: any }) {
        return x.id === item.data.company[0];
      });

      const projects = buildList(item.data.projects, projectJson.items);
      const contribs = buildList(item.data.contributions, projectJson.items);
      experiences.push(mapExperience(item, company, projects, contribs));
    }
    experiences.sort(dynamicSortMultiple("-orderDate"));

    return experiences;
  } catch {
    return [];
  }
}

export async function getProjects() {
  try {
    const projectData = await fetch(squidexUrl + "project", {
      headers: squidexHeaders,
    });

    const projectJson = await projectData.json();

    const projects: Project[] = [];

    for (const item of projectJson.items)
      if (item.data.IsHighlight === true) projects.push(mapProject(item));
    projects.sort(dynamicSortMultiple("-sortOrder", "title"));

    return projects;
  } catch {
    return [];
  }
}

export async function getHome() {
  try {
    const homeData = await fetch(squidexUrl + "home", {
      headers: squidexHeaders,
    });
    const homeJson = await homeData.json();
    return mapHome(homeJson.items[0]);
  } catch {
    return null;
  }
}