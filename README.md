# The Wolf of Wall Street — Colour Analysis

A student film study by Omar Taheri, with animated scene galleries, colour palettes, a character timeline, a YouTube video and browser PDF export.

Production address: **https://film.omartaheri.com**

## Deploy on Coolify

1. Create an application from `https://github.com/OmarTaheri/color-analysis`, branch `main`.
2. Choose the **Dockerfile** build pack.
3. Set **Base Directory** to `/` and **Dockerfile Location** to `/Dockerfile`.
4. Set **Ports Exposes** to `80`. No host port mapping is needed.
5. Set **Domains** to `https://film.omartaheri.com`.
6. Point the domain's DNS A record to your Coolify server's public IPv4 address. Only add an AAAA record if that server supports IPv6.
7. Deploy. Coolify handles HTTPS through its proxy. If application health checks are enabled, use HTTP, port `80`, path `/`.

No application secrets, database, persistent storage, or custom build/start commands are required. The Dockerfile builds the Next.js static export, then serves only the exported site with Nginx. Node.js and development dependencies are not included in the final container.

See the official [Coolify application settings](https://coolify.io/docs/applications/) and [domain setup](https://coolify.io/docs/knowledge-base/domains).

## Run with Docker

```sh
docker build -t color-analysis .
docker run --rm -p 8080:80 color-analysis
```

Open http://localhost:8080.

## Local development

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

`npm run build` creates the static site in `out/`. `next start` is not used because this project is a static export.

## Project contents

- `app/`: page, content, styling, animation and PDF export.
- `components/ui/`: the dialog and button used by scene studies.
- `public/`: only the 26 used film stills, video poster, three fonts, favicon and domain QR code.
- `Dockerfile` and `nginx.conf`: production container and static routing.

The header and footer PDF buttons generate a PDF from the current page. No old PDF snapshot is bundled. The footer QR code and canonical page address use `film.omartaheri.com`.

Film stills and fonts retain their respective owners' rights; this repository does not grant a licence to those assets.
