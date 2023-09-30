import { removeExportsPlugin } from "../plugins/remove-exports";

const ENTRYPOINT = "src/index.ts";
const OUTPATH = "drafts-actions.js";

// do not specify `out` directory to save bundled output in variable, allows for manual
// post-processing
const result = await Bun.build({
  entrypoints: [ENTRYPOINT],
  format: "esm",
  sourcemap: "none",
});

for (const output of result.outputs) {
  // Loop is necessary to access the bundled text
  const bundledText = await output.text();
  const removedExports = removeExportsPlugin(bundledText);

  // automatically writes to root level of the project!
  await Bun.write(OUTPATH, removedExports);
}
