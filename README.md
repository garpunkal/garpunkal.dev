# garpunkal.dev

![Screenshot of website](/screens/screenshot1.png)

This is my personal website that I use to learn new technologies.

The build currently utilises [SquidexCMS](https://squidex.io), [Astro](https://astro.build/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/) and [GitHub Pages](https://pages.github.com/).

## Deploy to GitHub Pages

1. In GitHub, go to **Settings > Pages**.
2. Under **Build and deployment**, choose **Source: GitHub Actions**.
3. Push to the `main` branch to trigger the deploy workflow.

The workflow file is at `.github/workflows/deploy.yml`.

### Trigger Deploy From CMS Webhook

The deploy workflow also listens for GitHub `repository_dispatch` events with `event_type` = `cms_publish`.

Configure your CMS webhook to send a `POST` request to:

```text
https://api.github.com/repos/garpunkal/garpunkal.dev/dispatches
```

With headers:

```text
Accept: application/vnd.github+json
Authorization: Bearer <GITHUB_TOKEN_WITH_REPO_ACCESS>
Content-Type: application/json
```

And JSON body:

```json
{
	"event_type": "cms_publish"
}
```

Use a GitHub token (PAT or GitHub App token) that has permission to dispatch repository events for this repo.

## .env file

```
DEVTO_API_KEY=XXXXXXXXXXXXX
```

```
SQUIDEX_KEY=YYYYYYYYY
```

## License

[MIT License](LICENSE.md)
