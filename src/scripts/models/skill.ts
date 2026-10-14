// @filename: skill.ts
export class Skill {
  id: number;
  title: string;
  url: string;
  background: string;
  foreground: string;
  group: string[];
  logo: string;
  groupTitle: string;
  groupOrder: number;

  constructor(
    id: number,
    title: string,
    url: string,
    background: string,
    foreground: string,
    group: string[],
    logo: string = "",
    groupTitle: string = "",
    groupOrder: number = 999,
  ) {
    this.id = id;
    this.title = title;
    this.url = url;
    this.background = background;
    this.foreground = foreground;
    this.group = group ?? [];
    this.logo = logo ?? "";
    this.groupTitle = groupTitle || (this.group[0] ?? "");
    this.groupOrder = groupOrder;
  }
}
