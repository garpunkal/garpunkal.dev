// @filename: squidex.ts
import { dynamicSortMultiple, buildList } from "./utils.ts";
import { mapExperience, mapProject, mapHome, mapSkill } from "./mapper.ts";
import { Project } from "./models/project.ts";
import { Experience } from "./models/experience.ts";
import { Skill } from "./models/skill.ts";

const squidexKey =
  import.meta.env.SQUIDEX_KEY ||
  import.meta.env.SQUIDEX_APP_NAME ||
  process.env.SQUIDEX_KEY ||
  process.env.SQUIDEX_APP_NAME ||
  "garpunkaldev";
const squidexUrl = "https://cloud.squidex.io/api/content/" + squidexKey + "/";

let squidexHeaders = new Headers();
squidexHeaders.append("X-Flatten", "true");
squidexHeaders.append("X-NoResolveLanguages", "1");
squidexHeaders.append("X-Languages", "en");
squidexHeaders.append("timeout", "1000");
squidexHeaders.append("retry", "3");
squidexHeaders.append("retryDelay", "4000");

const endpointCache = new Map<string, Promise<any>>();

async function fetchEndpointJson(endpoint: string, retries = 3): Promise<any> {
  const cached = endpointCache.get(endpoint);
  if (cached) return cached;

  const requestPromise = (async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(squidexUrl + endpoint, {
          headers: squidexHeaders,
        });
        if (!response.ok) {
          throw new Error(`Squidex ${endpoint} HTTP ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        lastError = err;
        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
    }
    endpointCache.delete(endpoint);
    throw lastError;
  })();

  endpointCache.set(endpoint, requestPromise);
  return requestPromise;
}

export async function getExperiences() {
  try {
    const [experienceJson, companyJson, projectJson] = await Promise.all([
      fetchEndpointJson("experience"),
      fetchEndpointJson("company"),
      fetchEndpointJson("project"),
    ]);

    // experiences
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
    const projectJson = await fetchEndpointJson("project");

    const projects: Project[] = [];

    for (const item of projectJson.items)
      projects.push(mapProject(item));
    projects.sort(dynamicSortMultiple("-sortOrder", "title"));

    return projects;
  } catch {
    return [];
  }
}

export async function getSkills() {
  try {
    const [skillJson, skillGroupJson] = await Promise.all([
      fetchEndpointJson("skill"),
      fetchEndpointJson("skillgroup"),
    ]);

    const groupItems = skillGroupJson.items || [];
    const skills: Skill[] = [];

    for (const item of skillJson.items) {
      const groupItem = groupItems.find((g: any) => {
        return item.data.group && item.data.group[0] === g.id;
      });
      skills.push(mapSkill(item, groupItem));
    }
    skills.sort(dynamicSortMultiple("title"));

    return skills;
  } catch {
    return [];
  }
}

export async function getHome() {
  try {
    const homeJson = await fetchEndpointJson("home");
    return mapHome(homeJson.items[0]);
  } catch {
    return null;
  }
}
