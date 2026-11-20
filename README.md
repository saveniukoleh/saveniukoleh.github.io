# Oleh Saveniuk — personal portfolio

Static multilingual site for **Oleh Saveniuk**, Senior Frontend / WebGL Engineer.  
Published at [saveniukoleh.com](https://saveniukoleh.com). The `CNAME` file is `saveniukoleh.com`.

## Stack

HTML5, CSS3, and vanilla JavaScript. No frameworks, npm, bundlers, or CDNs. Google Analytics is loaded from `googletagmanager.com`. The homepage hero uses a local Three.js build.

Asset URLs are root-absolute (`/css/…`, `/js/…`, `/assets/…`) so the English, German, and Ukrainian pages share one asset tree.

## Run locally

Root-absolute paths need a local HTTP server.

```bash
python3 -m http.server 8080
```

Then open [http://127.0.0.1:8080/](http://127.0.0.1:8080/), [http://127.0.0.1:8080/de/](http://127.0.0.1:8080/de/), and [http://127.0.0.1:8080/uk/](http://127.0.0.1:8080/uk/).

## Layout

| Path | Purpose |
| --- | --- |
| `index.html` | English homepage |
| `de/index.html` | German homepage |
| `uk/index.html` | Ukrainian homepage |
| `about/`, `de/about/`, `uk/about/` | About |
| `work/…`, `de/work/…`, `uk/work/…` | Case studies |
| `css/` | Tokens, base, layout, components, pages, responsive |
| `js/` | Boot, navigation, interactions, WebGL hero |
| `assets/documents/` | English CV and German Lebenslauf |
| `assets/images/` | Case-study screenshots |
| `assets/projects/preserved/` | Unpublished project fragment, not linked from the site |
| `robots.txt`, `sitemap.xml` | Crawler hints for the public HTML pages |

Breakpoints (see `css/tokens.css`): `40em` nav, `48em` two columns, `64em` hero split, `80em` wide.
