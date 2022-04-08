import * as Fs from "fs-extra";
import * as inquirer from "./inquirer";
import * as Path from "path";
import * as paths from "./paths";
import * as sfdx from "./sfdx";
import * as utils from "./utils";
import { getLogger } from "./logger";
const logger = getLogger();

export class PackageController {
  static async retrieve(manifestFile: string, orgAlias: string, destinationDir: string) {
    var hasError = false;
    try {
      await sfdx.executeCommand(`sfdx force:source:retrieve -x="${manifestFile}" -u="${orgAlias}"`);
    } catch (error) {
      logger.error({ message: error + "", throwError: false });
      hasError = true;
    }

    if (!hasError) {
      utils.deletePath(destinationDir);
      utils.movePath(paths.defaultDir, destinationDir);
      utils.copyFile(manifestFile, Path.join(destinationDir, "package.xml"));
    }

    // var manifestFile: string,
    //   downloadDir = Utils.defaultPackageDirectorie();

    // async function executeRetrieve(manifestFile: string, orgAlias: string) {
    //   var targetOrg: string = <string>process.env[orgAlias];
    //   infoLogger.info("Retrieving data from " + targetOrg);

    //

    // async function removeProfilesUserPermissions(profilePath: string) {
    //   if (!Fs.existsSync(profilePath)) {
    //     return infoLogger.info("Retrieved source dosn't has a Profile dir.");
    //   }

    //   var removeProfilesUserPermissions = await inquirer.confirm({ message: `Retrieved data has profiles, remove they user permissions?` });

    //   if (!removeProfilesUserPermissions) {
    //     return infoLogger.info("Don't removed profiles user permissions.");
    //   }

    //   for (let profileFile of Fs.readdirSync(profilePath, { withFileTypes: true })) {
    //     let rawFilePath = Path.join(profilePath, profileFile.name);
    //     if (!profileFile.isFile()) continue;

    //     let rawFile = Fs.readFileSync(rawFilePath).toString();
    //     var sanitizedFile = rawFile.replace(/<userPermissions>([\s\S]*)<\/userPermissions>\n<\/Profile>/, '');

    //     sanitizedFile = sanitizedFile.replace(/((\r\n|\n|\r)$)|(^(\r\n|\n|\r))|^\s*$/gm, '')
    //     sanitizedFile += '</Profile>';

    //     Fs.writeFileSync(rawFilePath, sanitizedFile)
    //   }

    // }

    //   manifestFile = await Utils.selectManifestFile();
    //   if (!!!manifestFile) return;

    //   executeRetrieve(manifestFile, await Utils.getTargetOrg())
  }
}
export class PackageHelper {
  static async selectPackage() {
    let response = await inquirer.selectFileOrDirPath({
      message: "Select a xml file to retrieve",
      rootPath: paths.manifest,
      type: "file"
    });

    logger.methodResponse(`package.ts/PackageHelper.selectPackage`, response);

    return response;
  }
}
