import * as inquirer from "inquirer";
import * as Path from "path";
import * as Fs from "fs-extra";
import { logger } from "./logger";

interface getListItemParams {
  message: string;
  multiples?: Boolean;
  options: Array<string | { name: string; value: string }>;
}

inquirer.registerPrompt("fileTreeSelection", require("inquirer-file-tree-selection-prompt"));

export async function confirm(options: { message: string; option?: { y: string; n: string }; invert?: Boolean }) {
  let option = options.option ?? { y: "Confirm", n: "No" };
  let choices = [option.y, option.n];

  if (options.invert) choices.reverse();

  let inquirerResponse = (
    await inquirer.prompt({
      type: "list",
      name: "resp",
      message: options.message,
      choices,
    })
  ).resp;

  let response = inquirerResponse == option.y;

  logger.methodResponse(`tools/inquirer.ts/confirm (${options.message})`, response);

  return response;
}

export async function getListItem(options: getListItemParams) {
  function validate(input: any) {
    if (options.multiples && input.length <= 0) {
      return "select at least one alias option";
    }

    return true;
  }

  let response = (
    await inquirer.prompt({
      type: options.multiples ? "checkbox" : "list",
      name: "resp",
      message: options.message,
      choices: options.options,
      validate: validate
    })
  ).resp;

  logger.methodResponse(`tools/inquirer.ts/getListItem (${options.message})`, response);

  return response;
}

export async function selectFileOrDirPath(options: {
  rootPath: string;
  message: string;
  type?: "dir" | "file";
  filter?: Set<string>;
  multiple?: boolean;
  fileType?: "xml";
}) {
  const validate = (input: string) => {
    if (options.fileType && !input.endsWith(options.fileType)) return "Invalid file type.";

    if (options.filter && options.filter.has(input)) {
      return `${input} was filtered.`;
    }

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
      validate: options.multiple ? () => true : validate,
      multiple: options.multiple
    })
  ).resp;

  logger.methodResponse(`tools/inquirer.ts/selectFileOrDirPath (${options.message})`, response);

  return response;
}

export async function getText(options: { message: string; default?: string }) {
  let response = (
    await inquirer.prompt({
      type: "input",
      name: "resp",
      message: options.message,
      default: options.default,
      validate: (input: string) => {
        return input != null && input != "";
      }
    })
  ).resp;

  logger.methodResponse(`tools/inquirer.ts/getListItem (${options.message})`, response);

  return response;
}
