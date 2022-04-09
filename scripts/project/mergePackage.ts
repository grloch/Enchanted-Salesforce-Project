import * as Path from "path";
import * as paths from "../../tools/paths";
import * as inquirer from "../../tools/inquirer";
import * as utils from "../../tools/utils";
import { PackageHelper, PackageBuilder } from "../../tools/package";
import { table } from "table";
import * as Fs from "fs-extra";
import { logger } from "../../tools/logger";

(async () => {
  let packageList = (<Array<string>>(
    await PackageHelper.selectPackage({ message: "Select the packages to merge", multiples: true })
  )).map((i: string) => {
    if (!i.endsWith(".xml")) logger.error({ message: `${i} isn't a valid package file`, throwError: true });
    return Path.normalize(i);
  });

  if (packageList.length < 2) {
    logger.error({ message: "Must select at least 2 files", throwError: true });
  }

  let fileName = await inquirer.getText({ message: "Merged filename", default: "merged.xml" });

  if (!fileName.endsWith(".xml")) fileName += ".xml";

  let outputPath = Path.join(paths.mergedPackages, fileName);

  let confirmOperation = await inquirer.confirm({
    message: `Confirm mergin (${packageList.length}) packages into "${fileName}" at "${outputPath}"`
  });
  if (!confirmOperation) return;

  if (Fs.existsSync(outputPath)) {
    let confirOverwrite = await inquirer.confirm({
      message: `File ${fileName} already exist, overwrite it?`
    });

    if (!confirOverwrite) return;
  }

  logger.setFileName({ filename: "mergeXML" });

  let parsedFiles = packageList.map((i) => utils.xml2json(i));

  utils.createDir(paths.mergedPackages);

  const startTime = new Date();

  const mergedPackage = new PackageBuilder();
  for (const parsedFile of parsedFiles) {
    mergedPackage.processFile(parsedFile);
  }

  mergedPackage.buildFile(outputPath);

  let tableData = [
    ["Merged", ""],
    ["Merged", packageList.map((i) => (i = i.replace(process.cwd() + "\\", ""))).join("\n")],
    ["Into", fileName]
  ];
  for (const type of mergedPackage.types) {
    tableData.push([`${type.name} (${type.members.length})`, type.members.join("\n")]);
  }

  logger.log({ message: table(tableData), prompt: true });
  
  const endTime = new Date();

  const diffTime = Math.abs(endTime.getTime() - startTime.getTime());
  console.log(`Duration: ${diffTime} milliseconds`);
})();
