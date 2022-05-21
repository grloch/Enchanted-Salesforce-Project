// import * as Fs from "fs";
import * as Path from "path";
import * as Fs from "fs-extra";
import { table } from "table";
import * as paths from "../../tools/paths";
import * as sfdxController from "../../tools/sfdx";
import * as utils from "../../tools/utils";
import * as inquirer from "../../tools/inquirer";
import * as sfdx from "../../tools/sfdx";
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

    let testLevel = await sfdx.getDeployTestLevel();

    let testOnly = await inquirer.confirm({
      message:
        "Check only? (Won't commit changes, only check the package dependecies and apex test classes if tests are runned)",
      option: { y: "Yes, I'm just checking my package", n: "No, save my changes on " + salesforceAlias },
      invert: true
    });

    // TODO check only

    let tableData = [
      ["Deploying", ""],
      ["SFDX org alias", salesforceAlias],
      ["Package", packageName],
      ["Package dir", packagePath],
      ["Test level", testLevel],
      ["Check only", testOnly]
    ];

    let logTable = table(tableData);

    logger.log({ message: `\n${logTable}`, prompt: false });
    console.log(logTable);

    return;

    let confirmDeploy = await inquirer.confirm({ message: "Execute deploy?" });

    if (confirmDeploy) {
      // sfdxController.rebaseForceApp(true);

      // Fs.copySync(packagePath, paths.defaultDir);

      await inquirer.confirm({ message: "Execute deploy?" });
      // utils.deletePath(paths.defaultDir);

      // TODO setup environment

      // TODO do deploy

      // TODO rebuild environment
      // sfdxController.rebaseForceApp(false);








    } else {
      logger.log({ message: "User canceled operation.", type: "ERROR", prompt: true });
    }
  } catch (error) {
    sfdxController.rebaseForceApp(false);
    logger.failedProcessEnded(error);
  }
})();
