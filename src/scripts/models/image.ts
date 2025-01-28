// @filename: image.ts
export class Image {
  url: string;
  background: string;
  alt: string;
  foreground: string;

  constructor(
    url: string,
    background: string,
    alt: string,
    foreground: string,
  ) {
    this.url = url;
    this.background = background;
    this.alt = alt;
    this.foreground = foreground;
  }
}
