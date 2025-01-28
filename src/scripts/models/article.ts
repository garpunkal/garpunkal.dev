// @filename: article.ts
export class Article {
  id: number;
  title: string;
  published_at: string;
  description: string;
  tag_list: string[];
  canonical_url: string;
  cover_image: string;
  positive_reactions_count: number;
  comments_count: number;

  constructor(
    id: number,
    title: string,
    published_at: string,
    description: string,
    tag_list: string[],
    canonical_url: string,
    cover_image: string,
    positive_reactions_count: number,
    comments_count: number,
  ) {
    this.id = id;
    this.title = title;
    this.published_at = published_at;
    this.description = description;
    this.tag_list = tag_list;
    this.canonical_url = canonical_url;
    this.cover_image = cover_image;
    this.positive_reactions_count = positive_reactions_count;
    this.comments_count = comments_count;
  }
}
