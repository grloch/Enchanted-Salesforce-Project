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

export async function getDeployTestLevel() {
  let options = [
    {
      name: "No test run (No tests are run. This test level applies only to deployments to development environments, such as sandbox, Developer Edition, or trial orgs. This test level is the default for development environments.)",
      value: "NoTestRun"
    },
    {
      name: "Run local tests (All tests in your org are run, except the ones that originate from installed managed and unlocked packages. This test level is the default for production deployments that include Apex classes or triggers.)",
      value: "RunLocalTests"
    },
    {
      name: "RunSpecifiedTests (Runs only the tests that you specify. Code coverage requirements differ from the default coverage requirements when using this test level. Executed tests must comprise a minimum of 75% code coverage for each class and trigger in the deployment package. This coverage is computed for each class and trigger individually and is different than the overall coverage percentage.)",
      value: "RunSpecifiedTests"
    },
    {
      name: "Run all tests in org (All tests in your org are run, including tests of managed packages.)",
      value: "RunAllTestsInOrg"
    }

    // RunLocalTests—
  ];
  return await inquirer.getListItem({ message: "Select the deploy test level", options: options });
}
