// @filename: project.ts
import type { Image } from "./image.ts";

export class Project {
  id: number;
  title: string;
  position: string;
  url: string;
  image: Image;
  sortOrder: number;
  isHighlight: boolean;
  isWinner: boolean;
  winnerLabel: string;
  winnerDescription: string;
  winnerUrl: string;
  personal: boolean;

  constructor(
    id: number,
    title: string,
    position: string,
    url: string,
    image: Image,
    sortOrder: number,
    isHighlight: boolean,
    isWinner: boolean,
    winnerLabel: string,
    winnerDescription: string,
    winnerUrl: string,
    personal: boolean
  ) {
    this.id = id;
    this.title = title;
    this.position = position;
    this.url = url;
    this.image = image;
    this.sortOrder = sortOrder;
    this.isHighlight = isHighlight;
    this.isWinner = isWinner;
    this.winnerLabel = winnerLabel;
    this.winnerDescription = winnerDescription;
    this.winnerUrl = winnerUrl;
    this.personal = personal;
  }
}
