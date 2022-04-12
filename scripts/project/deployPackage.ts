// import * as Fs from "fs";
import * as Path from "path";
import * as Fs from "fs-extra";
import { table } from "table";
import * as paths from "../../tools/paths";
import * as sfdxController from "../../tools/sfdx";
import * as utils from "../../tools/utils";
import * as inquirer from "../../tools/inquirer";
import { PackageHelper, PackageController } from "../../tools/package";

import { logger } from "../../tools/logger";

logger.setFileName({ filename: "retrieve" });
logger.info("Started deploy process");

require("dotenv").config();

function getAvaliabeOrgList() {
  let orgList = [];

  if (Fs.existsSync(paths.packageRoot)) {
    for (const i of Fs.readdirSync(paths.packageRoot, { withFileTypes: true })) {
      if (i.isDirectory()) {
        orgList.push(i.name);
      }
    }
  }

  return orgList;
}

(async () => {
  try {
    let avaliableList = getAvaliabeOrgList();

    if (avaliableList.length == 0) {
      logger.error("No avaliable org to deploy", true);
    }

    let salesforceAlias = await inquirer.getListItem({ message: "Select a org alias", options: avaliableList });

    let avaliablePackages = Fs.readdirSync(Path.join(paths.packageRoot, salesforceAlias));

    if (avaliablePackages.length == 0) {
      logger.error("No avaliable packages to deploy", true);
    }

    let packageName = await inquirer.getListItem({ message: "Select a package", options: avaliablePackages });

    let packagePath = Path.join(paths.packageRoot, salesforceAlias, packageName);
    let xmlPackagePath = Path.join(packagePath, "package.xml");

    let hasXmlPackage = Fs.existsSync(xmlPackagePath);

    if (!hasXmlPackage) {
      logger.error(`No avaliable xml for package at "${xmlPackagePath}"`, true);
    }

    let tableData = [
      ["Retriving", ""],
      ["SFDX org alias", salesforceAlias],
      ["Package", packageName],
      ["Package dir", packagePath]
    ];

    let logTable = table(tableData);

    logger.log({ message: `\n${logTable}`, prompt: false });
    console.log(logTable);

    // TODO Test level

    // NoTestRun—No tests are run. This test level applies only to deployments to development environments, such as sandbox, Developer Edition, or trial orgs. This test level is the default for development environments.

    // RunLocalTests—All tests in your org are run, except the ones that originate from installed managed and unlocked packages. This test level is the default for production deployments that include Apex classes or triggers.

    // TODO check only

    let confirmDeploy = await inquirer.confirm({ message: "Execute deploy?" });

    if (confirmDeploy) {
      sfdxController.rebaseForceApp(true);

      Fs.copySync(packagePath, paths.defaultDir);

      await inquirer.confirm({ message: "Execute deploy?" });
      utils.deletePath(paths.defaultDir);

      // TODO setup environment

      // TODO do deploy

      // TODO rebuild environment
      sfdxController.rebaseForceApp(false);
    } else {
      logger.log({ message: "User canceled operation.", type: "ERROR", prompt: true });
    }
  } catch (error) {
    sfdxController.rebaseForceApp(false);
    logger.failedProcessEnded(error);
  }
})();
