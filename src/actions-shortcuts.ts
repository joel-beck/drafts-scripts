import { copyToClipboard } from "./helpers-utils";

export const copyAllTagsToClipboard = (): void => {
  // NOTE: Keep comment for example of syntax
  // const allDrafts = Draft.query("", "all", [], [], "modified", true, false);
  // const allTagCombinations = allDrafts.map((draft) => draft.tags);
  // // flattens array of combinations into array of individual tags
  // const allTagsArray = [].concat(...allTagCombinations);
  // const uniqueTagsArray = [...new Set(allTagsArray)];

  // @ts-ignore
  const uniqueTagsArray = Tag.query("");
  const sortedTags = uniqueTagsArray.sort().join("\n");
  copyToClipboard(sortedTags);
};
