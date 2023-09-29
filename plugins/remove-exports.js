// function to remove everything after the `export` keyword from the bundled file since
// Drafts can't handle exports
// can be used a a plugin in the rollup config, see
// https://gist.github.com/mtone/c7cb55aaaa2c2702d7b1861d7e2fdbd8 for an example
export const removeExportsPlugin = (content) => {
  const exportIndex = content.indexOf("export");
  const containsExport = exportIndex !== -1;

  if (containsExport) {
    // text before the `export` keyword
    return content.substring(0, exportIndex);
  }
  return content;
};
