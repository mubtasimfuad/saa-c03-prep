# AWS SAA-C03 Prep

Personal revision reference for the AWS Certified Solutions Architect – Associate (SAA-C03) exam, built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) and published to GitHub Pages.

Live site: https://mubtasimfuad.github.io/saa-c03-prep/

## Local development

```bash
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
./.venv/bin/mkdocs serve
```

Then open http://127.0.0.1:8000/.

## Structure

- `docs/` — site content, one Markdown page per topic, grouped by service area.
- `source/saa-note.docx` — original source notes the site content is derived from.
- `mkdocs.yml` — site navigation and theme configuration.
- `.github/workflows/deploy.yml` — builds and deploys to GitHub Pages on push to `main`.
