# PAWBench project page

Static project page for **PAWBench: How Far Are We from Probabilistically Aligned World Modeling?**

This site is intentionally build-free. It adapts the frontend structure of the public PICABench project page (`Andrew0613/PICABench_webpage/static`) for PAWBench: header, byline, section jump row, research sections, expanded results table, acknowledgment, and BibTeX are organized in the same template style while using only PAWBench content and authorized PAWBench assets.

## Local preview

From the repository root:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Content and asset provenance

- Text is adapted from the current PAWBench manuscript in `/mnt/shared-storage-user/puyuandong/glv/pawbench-overleaf`.
- The main results table is sourced from `table/main_results.tex` in that manuscript checkout.
- `static/img/hero-teaser-spring.png` is the current user-selected PAWBench teaser and social preview image.
- The remaining figures are PAWBench manuscript figures already present in this target site.
- The known flawed taxonomy raster is intentionally not used.

Paper, Code, and Data buttons remain visibly marked **Coming soon** because no public URLs are authorized.

## Files

- `index.html`: single-page project website.
- `static/css/style.css`: template-style page, navigation, figure, and table styling.
- `static/js/main.js`: local jump navigation, figure zoom, and BibTeX copy behavior.
- `404.html`: self-contained static fallback page.
- `.nojekyll`: disables Jekyll processing on GitHub Pages.

## License

No license has been selected for this repository. Do not infer permission to reuse the source or assets until the project owners add an explicit license.
