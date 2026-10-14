// @filename: skill-group.ts
export class SkillGroup {
  id: string;
  title: string;
  sortOrder: number;

  constructor(id: string, title: string, sortOrder: number = 999) {
    this.id = id;
    this.title = title;
    this.sortOrder = sortOrder;
  }
}
