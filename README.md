# Oleh Saveniuk — personal portfolio

Static personal site for **Oleh Saveniuk** (frontend / creative developer).  
Repository: `saveniukoleh.github.io` (GitHub Pages user site).  
Planned custom domain: `saveniukoleh.com` (not configured yet — no `CNAME`).

## Stack

HTML5, CSS3, and vanilla JavaScript only. No frameworks, npm, bundlers, or CDNs.

Asset URLs are **root-absolute** (`/css/…`, `/js/…`) so English and Ukrainian pages share one stylesheet tree at the user-site root. Other GitHub repositories can still be published later as project sites under paths such as `https://saveniukoleh.com/repository-name/` without colliding with this site’s `/css`, `/js`, `/assets`, `/uk`, `/about`, or `/work` folders.

## Run locally

Root-absolute paths need a local HTTP server (opening `index.html` as a file will not load CSS/JS).

From this directory:

```bash
python3 -m http.server 8080
```

Then open [http://127.0.0.1:8080/](http://127.0.0.1:8080/) and [http://127.0.0.1:8080/uk/](http://127.0.0.1:8080/uk/).

## Layout

| Path | Purpose |
| --- | --- |
| `index.html` | English homepage |
| `uk/index.html` | Ukrainian homepage |
| `about/` · `uk/about/` | About stubs |
| `work/…` · `uk/work/…` | Reserved case-study stubs |
| `css/` | Tokens, base, layout, components, pages, responsive |
| `js/` | Boot, navigation, interactions, Canvas 2D hero |
| `assets/` | Icons, future images, fonts, documents |

Breakpoints (see `css/tokens.css`): `40em` nav, `48em` two columns, `64em` hero split, `80em` wide.

## Content still needed

- Email address
- LinkedIn URL
- CV file in `assets/documents/`
- Project case-study copy and real screenshots (homepage cards currently use CSS placeholders)
- Employment details for About
- Open Graph image
- Custom domain (`CNAME`) after DNS is purchased and configured
- GitHub remote / Pages publish (not created in this phase)

GitHub is linked as [github.com/saveniukoleh](https://github.com/saveniukoleh) because that matches this user-site repository name. Confirm if the account URL should differ.
