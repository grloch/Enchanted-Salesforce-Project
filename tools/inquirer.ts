import * as inquirer from "inquirer";
import * as Path from "path";
import * as Fs from "fs-extra";

interface getListItemParams {
  message: string;
  multiples?: Boolean;
  options: Array<string | { name: string; value: string }>;
}

inquirer.registerPrompt("fileTreeSelection", require("inquirer-file-tree-selection-prompt"));

export async function confirm(options: { message: string; option?: { y: string; n: string } }) {
  let response = (await inquirer.prompt({ type: "confirm", name: "resp", message: options.message })).resp;

  return response;
}

export async function getListItem(options: getListItemParams) {
  function validate(input: any) {
    if (options.multiples && input.length <= 0) {
      return "select at least one alias option";
    }

    return true;
  }

  return (
    await inquirer.prompt({
      type: options.multiples ? "checkbox" : "list",
      name: "resp",
      message: options.message,
      choices: options.options,
      validate: validate
    })
  ).resp;
}

export async function selectFileOrDirPath(options: { rootPath: string; message: string; type?: "dir" | "file" }) {
  const validate = (input: string) => {
    switch (options.type) {
      case "dir":
        return Fs.lstatSync(input).isDirectory() ? true : `"${input}" isn't a valid directory`;

      case "file":
        return Fs.lstatSync(input).isFile() ? true : `"${input}" isn't a valid file`;

      default:
        return true;
    }
  };

  let response = (
    await inquirer.prompt({
      //@ts-ignore
      type: "fileTreeSelection",
      name: "resp",
      message: options.message,
      root: options.rootPath,
      validate: validate
    })
  ).resp;

  return response;
}
