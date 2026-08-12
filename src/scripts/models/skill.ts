// @filename: skill.ts
export class Skill {
  id: number;
  title: string;
  url: string;
  background: string;
  foreground: string;
  percentage: number;

  constructor(
    id: number,
    title: string,
    url: string,
    background: string,
    foreground: string,
    percentage: number,
  ) {
    this.id = id;
    this.title = title;
    this.url = url;
    this.background = background;
    this.foreground = foreground;
    this.percentage = percentage;
  }
}
