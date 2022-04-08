import * as Path from "path";
import * as Fs from "fs-extra";
import * as paths from "./paths";
import * as inquirer from "./inquirer";
import * as logger from "./logger";

export function rebaseForceApp(isBefore: Boolean) {
  if (isBefore && !Fs.existsSync(paths.defaultDir)) {
    Fs.mkdirSync(paths.defaultDir, { recursive: true });
  }

  var oldPath = isBefore ? paths.forceApp : paths.tempForceApp;
  var newPath = isBefore ? paths.tempForceApp : paths.forceApp;

  if (!isBefore) {
    Fs.rmSync(paths.forceApp, { recursive: true });
  }

  if (Fs.existsSync(oldPath) && !Fs.existsSync(newPath)) {
    Fs.renameSync(oldPath, newPath);
    console.log(`Renamed "${oldPath}" to: "${newPath}"`);
  }

  if (isBefore) {
    Fs.mkdirSync(paths.defaultDir, { recursive: true });
  }
}

export async function getSalesforceOrgAlias() {
  return await inquirer.getListItem({
    message: "Select target environments",
    options: getLocalOrgsAlias()
  });
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
      `No SFDX alias founded on ./.env or a default or for current project, make sure that all org alias are added on SF_ORGLIST variable of ./.env, separeted by ";"`
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
