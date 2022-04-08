// import * as Fs from "fs";
import * as Path from "path";
import * as Fs from "fs-extra";
import { table } from "table";
import * as paths from "../../tools/paths";
import * as sfdxController from "../../tools/sfdx";
import * as inquirer from "../../tools/inquirer";
import { PackageHelper, PackageController } from "../../tools/package";

import { getLogger } from "../../tools/logger";

const logger = getLogger({ filename: "retrieve" });

require("dotenv").config();

(async () => {
  sfdxController.rebaseForceApp(true);

  var salesforceAlias = await sfdxController.getSalesforceOrgAlias();
  var manifestFilePath = await PackageHelper.selectPackage();

  var packageName = Path.basename(manifestFilePath, Path.extname(manifestFilePath));
  logger.methodResponse("set packageName", packageName);

  var destinationDir = Path.join(paths.packageRoot, salesforceAlias, packageName);
  logger.methodResponse("set destinationDir", destinationDir);

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

  logger.log({ message: table(tableData), prompt: true });

  let confirmRetrieve = await inquirer.confirm({ message: "Execute retrieve?" });

  if (!confirmRetrieve) {
    logger.log({ message: "User canceled the operation.", prompt: true });
  } else {
    logger.log({ message: "Starting sfdx", prompt: true });

    await PackageController.retrieve(manifestFilePath, salesforceAlias, destinationDir);
  }

  sfdxController.rebaseForceApp(false);
})();
