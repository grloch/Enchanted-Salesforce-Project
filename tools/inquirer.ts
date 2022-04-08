import * as inquirer from "inquirer";

inquirer.registerPrompt(
  "fileTreeSelection",
  require("inquirer-file-tree-selection-prompt")
);

export async function selectFileOrDirPath(options: {
  rootPath: string;
  message: string;
}) {
  let response = (
    await inquirer.prompt({
      //@ts-ignore
      type: "fileTreeSelection",
      name: "resp",
      message: options.message,
      root: options.rootPath
    })
  ).resp;

  return response;
}
