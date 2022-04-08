import * as Path from "path";
import * as Fs from "fs-extra";
import * as paths from "./paths";
import * as inquirer from "./inquirer";
import { getLogger } from "./logger";
import * as ChildProcess from "child_process";
import * as Utils from "./utils";

const logger = getLogger();

export function rebaseForceApp(isBefore: Boolean) {
  var oldPath = isBefore ? paths.forceApp : paths.tempForceApp;
  var newPath = isBefore ? paths.tempForceApp : paths.forceApp;

  if (isBefore) {
    Utils.createDir(paths.defaultDir);

    if (Fs.existsSync(oldPath) && !Fs.existsSync(newPath)) {
      Utils.movePath(oldPath, newPath);
    }

    Utils.createDir(paths.defaultDir);
  } else {
    Utils.createDir(paths.defaultDir);

    if (Fs.existsSync(oldPath) && Fs.existsSync(newPath)) {
      Utils.deletePath(newPath);
    }

    Utils.movePath(oldPath, newPath);
  }

  // if (!isBefore) {
  //   Fs.rmSync(paths.forceApp, { recursive: true });
  //   logger.log({ message: `Removed "${paths.forceApp}"` });
  // }

  // if (isBefore) {
  //   Fs.mkdirSync(paths.defaultDir, { recursive: true });
  //   logger.log({ message: `Created dir "${paths.defaultDir}"` });
  // }
}

export async function getSalesforceOrgAlias(options?: { multiples?: boolean }) {
  let { multiples } = options ?? {};

  let response = await inquirer.getListItem({
    message: "Select target environments",
    options: getLocalOrgsAlias(),
    multiples
  });

  logger.methodResponse(`sfdx.ts/getSalesforceOrgAlias`, response);

  return response;
}

export function getLocalOrgsAlias() {
  let defaultusername: string = getDefaultOrg();
  const aliasOptions: Array<string | { name: string; value: string }> = [];

  if (defaultusername) {
    aliasOptions.push({
      name: `${defaultusername} (default)`,
      value: defaultusername
    });
  }

  if (process.env.SF_ORGLIST) {
    process.env.SF_ORGLIST.split(";").map((i) => {
      if (i != defaultusername) aliasOptions.push(i);
    });
  }

  if (aliasOptions.length == 0) {
    logger.error({
      message: `No SFDX alias founded on ./.env or a default or for current project, make sure that all org alias are added on SF_ORGLIST variable of ./.env, separeted by ";"`,
      throwError: true
    });
  }

  return aliasOptions;
}

export function getDefaultOrg() {
  if (Fs.existsSync(paths.sfdxConfig)) {
    let sfdxConfig = require(paths.sfdxConfig);

    return sfdxConfig.defaultusername;
  }

  return null;
}

export function executeCommand(sfdxCommand: string) {
  logger.log({ message: "Executing SFDX command: " + sfdxCommand });

  const sfdxProcess = ChildProcess.execSync(sfdxCommand).toString();
  for (var i of sfdxProcess.split("\n")) {
    if (i && i.trim() != "") {
      logger.log({ message: i, prompt: true });
    }
  }
}
