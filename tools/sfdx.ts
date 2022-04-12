import * as Path from "path";
import * as Fs from "fs-extra";
import * as paths from "./paths";
import * as inquirer from "./inquirer";
import { logger } from "./logger";
import * as ChildProcess from "child_process";
import * as Utils from "./utils";

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
    logger.error(
      `No SFDX alias founded on ./.env or a default or for current project, make sure that all org alias are added on SF_ORGLIST variable of ./.env, separeted by ";"`,
      true
    );
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
  logger.info("Executing SFDX command: " + sfdxCommand);

  let splitter = "────────────────────────────────────────────────────────────────────────────────────────────────────";

  const sfdxProcess = `${splitter}\n${ChildProcess.execSync(sfdxCommand).toString()}\n${splitter}`;
  for (var i of sfdxProcess.split("\n")) {
    if (i && i.trim() != "") {
      logger.log({ message: i, prompt: true });
    }
  }
}
