import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";

// function to remove everything after the `export` keyword from the bundled file since
// Drafts can't handle exports
// can be used a a plugin in the rollup config, see
// https://gist.github.com/mtone/c7cb55aaaa2c2702d7b1861d7e2fdbd8 for an example
const removeExportsPlugin = () => {
  return {
    renderChunk(code) {
      const exportIndex = code.indexOf("export");
      const containsExport = exportIndex !== -1;

      if (containsExport) {
        // text before the `export` keyword
        return code.substring(0, exportIndex);
      }
      return code;
    },
  };
};

export default {
  input: "src/index.ts",
  output: {
    file: "drafts-actions.js",
    format: "es",
    sourcemap: false,
  },
  plugins: [typescript(), resolve(), removeExportsPlugin()],
};
