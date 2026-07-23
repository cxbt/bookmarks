# OpenBookmark Public Site

Hugo site for public bookmarks served at `https://bookmark.cxbt.kr`.

## Local Development

```bash
hugo server
```

Build:

```bash
hugo --minify
```

## Content

Bookmark files live under:

```text
content/bookmarks/<bookmark-id>.md
```

The bookmarker server writes these files. External targets are stored as `source_url`; top-level `url` is reserved by Hugo for page permalinks. Public thumbnail assets live under:

```text
static/images/bookmarks/<bookmark-id>.png
```

Private backup artifacts are not stored in this repository.

## Deployment

GitHub Pages deploys from `.github/workflows/pages.yml` on every push to `main`.

Required repository settings:

- Pages source: GitHub Actions
- Custom domain: `bookmark.cxbt.kr`
