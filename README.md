# User Scripts for Drafts

This repository contains a collection of scripts for the [Drafts](https://getdrafts.com/) app.


## Repository Structure

All source code is written in Typescript files inside the `src` directory.
The Typescript files are roughly organized into Drafts action groups.

It is good practice to dedicate a separate function to each Drafts action.
This has the advantage that only a single function call is required inside the Drafts `Script` step.


### Bundling

Drafts expects a single Javascript file that contains all the code which is used inside Drafts actions.
Thus, the [Rollup](https://rollupjs.org) bundler is used to bundle all Typescript files in the `src` directory into a single Javascript file (here `drafts-actions.js` ).

The bundling process is configured in the `rollup.config.js` file:

- The option `input: "src/index.ts"` specifies the entry point for the bundling process. The file `index.ts` re-exports all functions from the remaining Typescript files that are used inside Drafts actions.

- The option `output: "drafts-actions.js"` specifies the output file for the bundled Javascript code. The name of the output file is later used in the `Script` step of Drafts actions.


By default, the bundled Javascript file with the configuration option `format: "es"` contains exports at the end.
This is not supported by Drafts, so the `rollup.config.js` file contains a custom plugin that removes the exports section. The plugin is based on [this GitHub Gist](https://gist.github.com/mtone/c7cb55aaaa2c2702d7b1861d7e2fdbd8).


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

- The idea to modularize scripts into separate files came from [this forum discussion](https://forums.getdrafts.com/t/developing-outside-of-drafts).

- The `drafts-type-definitions.js` file is provided by Greg Pierce (the Drafts creator) and copied from [his GitHub repository](https://github.com/agiletortoise/drafts-script-reference/blob/main/docs/drafts-definitions.js).