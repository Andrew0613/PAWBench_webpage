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
- The evaluation and intervention tables are sourced from `table/main_results.tex`, `table/vlm_future_prediction.tex`, `table/target_prompt_results.tex`, `table/c2c_sampling_results.tex`, and `table/training_distribution_summary.tex` in that manuscript checkout.
- `static/img/hero-teaser-spring.png` is the current user-selected PAWBench teaser and social preview image.
- `static/img/scenario_taxonomy.png` is a crop-box-faithful PNG export of the manuscript's current Figure 2 (`figure/rendered/scenario_taxonomy.pdf`).
- `static/img/rollout_budget_diagnostics.png` is the manuscript's current rollout-budget robustness figure.
- `static/video/rollouts/` contains twelve web-compressed, base-condition `r000` rollouts for the cross-model gallery. `provenance.json` binds every clip to its PAWBench run, sample ID, PAWEval terminal label, source hash, and compressed-asset hash.
- The remaining figures are PAWBench manuscript figures already present in this target site.

The compact arXiv, PDF, Code, and Benchmark resource controls remain disabled until their public URLs are authorized.

## Files

- `index.html`: single-page project website.
- `static/css/style.css`: template-style page, navigation, figure, and table styling.
- `static/js/main.js`: local jump navigation, synchronized rollout comparison, figure zoom, and BibTeX copy behavior.
- `404.html`: self-contained static fallback page.
- `.nojekyll`: disables Jekyll processing on GitHub Pages.

## License

No license has been selected for this repository. Do not infer permission to reuse the source or assets until the project owners add an explicit license.
