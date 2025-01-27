// @filename: devto.ts
import { Article } from './models/article';
import { DynamicSortMultiple } from "./utils";
import { MapArticle } from "./mapper";

const devToApiKey = import.meta.env.DEVTO_API_KEY;
const devToUrl = 'https://dev.to/api/articles/me/published?api-key=';

export async function GetArticles(page = 1) {
    let response = await fetch(devToUrl + devToApiKey + '?page=' + page, {
        method: "GET",
        headers: {
            'api-key': devToApiKey,
            'Content-Type': 'application/vnd.forem.api-v1+json'
        }
    });

    const posts = await response.json();

    if (posts.length >= 30 && posts.length !== 0)
        GetArticles(++page);

    const articles: Article[] = [];

    for (let post of posts)
        articles.push(MapArticle(post))

    articles.sort(DynamicSortMultiple("-published_at"));
    return articles;
}