import * as Fs from "fs-extra";
import * as inquirer from "./inquirer";
import * as Path from "path";
import * as paths from "./paths";
import * as sfdx from "./sfdx";
import * as utils from "./utils";
import * as convert from "xml-js";
import { logger } from "./logger";

type SfdxDeployTestLevel = "NoTestRun" | "RunLocalTests" | "RunAllTestsInOrg" | "RunSpecifiedTests";

interface SfdxOptions {
  targetUsername: string;
}

interface DeployOptions extends SfdxOptions {
  sourcepath: string;
}

interface DeployOptionsWithTest extends DeployOptions {
  testLevel: "NoTestRun" | "RunLocalTests" | "RunAllTestsInOrg";
}

interface DeployWithSpecifiedTests extends DeployOptions {
  testLevel: "RunSpecifiedTests";
  runTests: Array<string>;
}

export class PackageController {
  static async retrieve(manifestFile: string, orgAlias: string, destinationDir: string) {
    // TODO log xml before retrieve
    var hasError = false;
    try {
      await sfdx.executeCommand(`sfdx force:source:retrieve -x="${manifestFile}" -u="${orgAlias}"`);
    } catch (error) {
      logger.error(error + "", false);
    }

    if (!hasError) {
      utils.deletePath(destinationDir);
      utils.movePath(paths.defaultDir, destinationDir);
      utils.copyFile(manifestFile, Path.join(destinationDir, "package.xml"));
    }
  }

  static async deploy(options: DeployOptions | DeployOptionsWithTest | DeployWithSpecifiedTests) {
    let sfdxCommand = `sfdx force:source:deploy --targetusername ${options.targetUsername} --sourcepath ${options.sourcepath}`;

    try {
      // await sfdx.executeCommand(`sfdx force:source:deploy --targetusername ${orgAlias} --sourcepath ${packagePath} --testlevel RunLocalTests
      // `);
    } catch (error) {
      logger.error(error + "", false);
    }
  }
}

export class PackageHelper {
  static async selectPackage(options?: { message?: string; filter?: Set<string>; multiples?: boolean }) {
    options = options ?? {};

    options.message = options.message ?? "Select a xml file to retrieve";

    let response = await inquirer.selectFileOrDirPath({
      rootPath: paths.manifest,
      type: "file",
      message: options.message,
      filter: options.filter,
      multiple: options.multiples,
      fileType: "xml"
    });

    logger.methodResponse(`package.ts/PackageHelper.selectPackage`, response);

    return response;
  }
}

export class PackageBuilder {
  private packageMembers: Map<string, Set<string>>;
  private xmlFile: any;

  constructor() {
    this.packageMembers = new Map<string, Set<string>>();

    this.xmlFile = {
      _declaration: {
        _attributes: { version: "1.0", encoding: "UTF-8", standalone: "yes" }
      },
      Package: {
        types: [],
        version: "51.0"
      }
    };
  }

  get types() {
    return this.xmlFile.Package.types;
  }

  public addMetadata(metadata: string, member: string) {
    if (!metadata || !member) return;

    metadata = utils.capitalize(metadata.toLocaleLowerCase());

    if (!this.packageMembers.has(metadata)) {
      this.packageMembers.set(metadata, new Set([member]));
    } else {
      this.packageMembers.get(metadata)?.add(member);
    }
  }

  public buildFile(path: string = "") {
    let totalSize = 0;
    logger.log({ message: `Building metadata:` });
    for (const mtdaName of [...this.packageMembers.keys()].sort()) {
      let itensSize = this.packageMembers.get(mtdaName)?.size;
      totalSize += itensSize!;

      logger.log({ message: `- ${mtdaName}: ${itensSize} iten${itensSize! > 1 ? "s" : ""}` });

      this.xmlFile.Package.types.push({
        members: [...this.packageMembers.get(mtdaName)!].sort(),
        name: mtdaName
      });
    }

    logger.log({ message: "Total metadata itens: " + totalSize });
    if (this.packageMembers.has("Profile")) logger.log({ message: "Package contains Profile metadata" });

    if (path != "") this.saveFile(path);

    return this.xmlFile;
  }

  public saveFile(path: string, fileName: string = "") {
    let savePath = fileName != "" ? Path.join(path, fileName) : path;

    if (Fs.existsSync(savePath)) logger.log({ message: `${savePath} already exist, file was replaced!` });

    Fs.writeFileSync(
      savePath,
      convert.json2xml(this.xmlFile, {
        compact: true,
        ignoreComment: true,
        spaces: 4
      })
    );
  }

  public processFile(file: any) {
    for (const element of file.elements[0].elements) {
      if (element.name != "types") continue;

      let fileTypes = element.elements;
      var typeName: string = "";

      const members: string[] = [];

      for (const typeItem of fileTypes) {
        if (typeName == "" && typeItem.name == "name") {
          typeName = typeItem.elements[0].text;
        } else if (typeItem.name == "members") {
          members.push(typeItem.elements[0].text);
        }
      }

      if (typeName == "") continue;

      for (let m of members) this.addMetadata(typeName, m);
    }
  }
}
