// import * as Fs from "fs";
import * as Path from "path";
import * as Fs from "fs-extra";
import { table } from "table";
import * as paths from "../../tools/paths";
import * as sfdxController from "../../tools/sfdx";
import * as inquirer from "../../tools/inquirer";
import { PackageHelper, PackageController } from "../../tools/package";
import { logger } from "../../tools/logger";

logger.setFileName({ filename: "retrieve" });
logger.info("Started retrieve process");

require("dotenv").config();

(async () => {
  try {
    var salesforceAlias = await sfdxController.getSalesforceOrgAlias();
    var manifestFilePath = await PackageHelper.selectPackage();

    var packageName = Path.basename(manifestFilePath, Path.extname(manifestFilePath));
    logger.info("Package name: " + packageName);

    var destinationDir = Path.join(paths.packageRoot, salesforceAlias, packageName);
    logger.info("Package destination dir: " + destinationDir);

    let tableData = [
      ["Retriving", ""],
      ["SFDX org alias", salesforceAlias],
      ["Manifest", manifestFilePath],
      [
        "Destination dir",
        `${destinationDir}${
          Fs.existsSync(destinationDir) ? "\nDestination folder already exist, it will be replaced." : ""
        }`
      ]
    ];

    let logTable = table(tableData);

    logger.log({ message: `\n${logTable}`, prompt: false });
    console.log(logTable);

    let confirmRetrieve = await inquirer.confirm({ message: "Execute retrieve?" });

    if (!confirmRetrieve) {
      logger.log({ message: "User canceled the operation.", prompt: true });
    } else {
      sfdxController.rebaseForceApp(true);

      logger.log({ message: "Starting sfdx", prompt: true });

      await PackageController.retrieve(manifestFilePath, salesforceAlias, destinationDir);

      sfdxController.rebaseForceApp(false);
    }
  } catch (error) {
    sfdxController.rebaseForceApp(false);
    logger.failedProcessEnded(error);
  }
})();
