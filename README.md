# Action Scripts for Drafts

This repository contains a collection of action scripts for the [Drafts](https://getdrafts.com/) app.


## Repository Structure

All source code is written in Typescript files in the `src` directory.
The Typescript files are roughly organized into Drafts action groups.

It is good practice to dedicate a separate function to each Drafts action.
This has the advantage that only a single function call is required in the Drafts `Script` step.


### Bundling

Drafts expects a single Javascript file that contains all the code used in Drafts actions.
To bundle all Typescript files in the `src` directory into a single Javascript file (here `drafts-actions.js`), the project has moved from the [Rollup](https://rollupjs.org) bundler to using [Bun](https://bun.sh).
Bun not only simplifies the bundling process, but additionally replaces `npm` as a package manager and `node` as a runtime environment.

The bundling process is straightforward:

- All Drafts actions (functions in the `src/*.ts` Typescript files) are re-exported in the `src/index.ts` file.

- The `scripts/build.js` script uses `src/index.ts` as the entry point and bundles all Typescript files into a single Javascript file `drafts-actions.js`. The name of this output file is later used in the `Script` step of Drafts actions.

    ```js
    const ENTRYPOINT = "src/index.ts";
    const OUTPATH = "drafts-actions.js";

    const result = await Bun.build({
    entrypoints: [ENTRYPOINT],
    format: "esm",
    sourcemap: "none",
    });
    ```

- One additional cleanup step is required to make the bundled Javascript file compatible with Drafts.
The bundled Javascript file contains exports at the end, which is not supported by Drafts.
Therefore, the `scripts/build.js` script removes the exports section from the bundled Javascript file prior to writing the bundled output to `drafts-actions.js`.

- The bundling process is executed by running `bun scripts/build.js` from the command line, or, alternatively, `bun run build` as defined in the `scripts` section of the `package.json` file.
To run the bundling process in watch mode, use `bun watch`.


## Usage inside Drafts

User scripts can be connected to the Drafts app as follows:

1. Move the scripts directory inside the default Drafts Scripts directory - in my case `~/Library/Mobile Documents/iCloud~com~agiletortoise~Drafts5/Documents/Library/Scripts`
1. Choose the `Script` step inside a Drafts action and import the function for this action with `require()` from the bundled Javascript file. Provide the **relative path to the script file** with respect to the default Drafts scripts directory. Then call the function for this action.

### Example

The following example uses the `insertMarkdownLink()` function inside a Drafts action.
This user scripts repository is a child directory of the default Drafts Scripts directory with the name `custom-scripts`.
The bundled Javascript file is named `drafts-actions.js`.

Then, the code inside the action `Script` step is

```javascript
require("custom-scripts/drafts-actions.js")

insertMarkdownLink()
```


## Resources

- The idea to modularize scripts into separate files originates from [this forum discussion](https://forums.getdrafts.com/t/developing-outside-of-drafts).

- The `drafts-type-definitions.js` file is provided by Greg Pierce (the Drafts creator) and copied from [his GitHub repository](https://github.com/agiletortoise/drafts-script-reference/blob/main/docs/drafts-definitions.js).
