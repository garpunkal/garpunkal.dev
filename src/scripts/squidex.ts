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

async function fetchData(endpoint: string) {
  try {
    const response = await fetch(squidexUrl + endpoint, {
      headers: squidexHeaders,
    });

    if (!response.ok) {
      throw new Error(`Error fetching ${endpoint} data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint} data:`, error);
    return null;
  }
}

export async function getExperiences() {
  const experienceJson = await fetchData("experience");
  const companyJson = await fetchData("company");
  const projectJson = await fetchData("project");

  if (!experienceJson || !companyJson || !projectJson) {
    return [];
  }

  const experiences: Experience[] = [];

  for (const item of experienceJson.items) {
    const company = companyJson.items.find((x: { id: any }) => x.id === item.data.company[0]);

    const projects = buildList(item.data.projects, projectJson.items);
    const contribs = buildList(item.data.contributions, projectJson.items);
    experiences.push(mapExperience(item, company, projects, contribs));
  }
  experiences.sort(dynamicSortMultiple("-orderDate"));

  return experiences;
}

export async function getProjects() {
  const projectJson = await fetchData("project");

  if (!projectJson) {
    return [];
  }

  const projects: Project[] = [];

  for (const item of projectJson.items) {
    if (item.data.IsHighlight === true) {
      projects.push(mapProject(item));
    }
  }
  projects.sort(dynamicSortMultiple("-sortOrder", "title"));

  return projects;
}

export async function getHome() {
  const homeJson = await fetchData("home");

  if (!homeJson) {
    return null;
  }

  return mapHome(homeJson.items[0]);
}