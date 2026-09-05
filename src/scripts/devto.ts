// @filename: devto.ts
import { Article } from "./models/article.ts";
import { dynamicSortMultiple } from "./utils.ts";
import { mapArticle } from "./mapper.ts";

const devToApiKey = import.meta.env.DEVTO_API_KEY ?? import.meta.env.DEV_KEY;
const devToUrl = "https://dev.to/api/articles/me/published?api-key=";
const publicDevToUrl = "https://dev.to/api/articles?username=garpunkal";

export async function getArticles(page = 1, accumulatedArticles: Article[] = [])
  : Promise<Article[]> {
  try {
    const authenticatedUrl = devToApiKey
      ? devToUrl + devToApiKey + "&page=" + page
      : null;
    const publicUrl = publicDevToUrl + "&page=" + page;
    const response = await fetch(authenticatedUrl ?? publicUrl, {
      method: "GET",
      headers: { "Content-Type": "application/vnd.forem.api-v1+json" },
    });

    const fallbackResponse = authenticatedUrl && !response.ok
      ? await fetch(publicUrl, {
          method: "GET",
          headers: { "Content-Type": "application/vnd.forem.api-v1+json" },
        })
      : response;

    if (!fallbackResponse.ok) {
      throw new Error(`Error fetching articles: ${response.statusText}`);
    }

    const posts: any[] = await fallbackResponse.json();
    const articles = accumulatedArticles.concat(posts.map(mapArticle));

    if (posts.length >= 30) {
      return getArticles(page + 1, articles);
    }

    articles.sort(dynamicSortMultiple("-published_at"));
    return articles;
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return accumulatedArticles;
  }
}