import { Command, Flags, HelpBase } from "@oclif/core";
import * as Path from "path";
import * as Fs from "fs";
import * as Utils from "../../utils";
import * as paths from "../../paths";

export default class PackageNew extends Command {
  static description = ""; // TODO PackageNew description

  static examples = [``]; // TODO PackageNew examples

  static flags = {
    name: Flags.string({ char: "n", required: true }), // TODO PackageNew flags name description
    help: Flags.help({ char: "h", description: "Command help" }),
    force: Flags.boolean({ char: "f" }), // TODO PackageNew flags force description
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(PackageNew);

    const normalizedName = Utils.sanitizeString(flags.name);
    const packagePath = Path.join(paths.packages, `${normalizedName}.xml`);
    const fileExist = Fs.existsSync(packagePath);

    if (!Fs.existsSync(paths.packages)) Fs.mkdirSync(paths.packages, { recursive: true });
    if (fileExist && !flags.force) {
      let errorOptions = {
        suggestions: ["Use -f to force replace", "Check the file name and try again"],
        exit: 2,
      };
      this.error(`"${packagePath}" already exists.`, errorOptions);
    }

    const packageContent = Fs.readFileSync(paths.defaultPackage).toString().replace("!{fullname}", flags.name);

    Fs.writeFileSync(packagePath, packageContent);

    this.log(`Created ${packagePath}`);
  }
}
