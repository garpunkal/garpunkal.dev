// @filename: devto.ts
import { Article } from "./models/article.ts";
import { dynamicSortMultiple } from "./utils.ts";
import { mapArticle } from "./mapper.ts";

const devToApiKey = import.meta.env.DEVTO_API_KEY;
const devToUrl = "https://dev.to/api/articles/me/published?api-key=";

export async function getArticles(page = 1) {
  let response = await fetch(devToUrl + devToApiKey + "&page=" + page, {
    method: "GET",
    headers: {
      "api-key": devToApiKey,
      "Content-Type": "application/vnd.forem.api-v1+json",
    },
  });

  const posts = await response.json();

  if (posts.length >= 30 && posts.length !== 0) getArticles(++page);

  const articles: Article[] = posts.map((post: any): Article => mapArticle(post));

  articles.sort(dynamicSortMultiple("-published_at"));
  return articles;
}