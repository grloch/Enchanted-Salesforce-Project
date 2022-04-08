import * as inquirer from "./inquirer";
import * as paths from "./paths";

export class PackageController {}
export class PackageHelper {
  static async selectPackage() {
    return await inquirer.selectFileOrDirPath({ message: "Select a xml file to retrieve", rootPath: paths.manifest });
  }
}
