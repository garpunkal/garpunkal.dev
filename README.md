# garpunkal.dev

![Screenshot of website](/screens/screenshot1.png)

This is my personal website that I use to learn new technologies.

The build currently utilises [SquidexCMS](https://squidex.io), [Astro](https://astro.build/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/) and [GitHub Pages](https://pages.github.com/).

## Deploy to GitHub Pages

1. In GitHub, go to **Settings > Pages**.
2. Under **Build and deployment**, choose **Source: GitHub Actions**.
3. Push to the `main` branch to trigger the deploy workflow.

The workflow file is at `.github/workflows/deploy.yml`.

## .env file

```
DEVTO_API_KEY=XXXXXXXXXXXXX
```

```
SQUIDEX_KEY=YYYYYYYYY
```

## License

[MIT License](LICENSE.md)
