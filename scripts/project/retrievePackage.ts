// import * as Fs from "fs";
import * as Path from "path";
import * as ChildProcess from "child_process";
import * as Fs from "fs-extra";

require("dotenv").config();

let paths = {
  forceApp: "force-app",
  tempForceApp: "_tempForceApp",
  defaultDir: Path.join("force-app", "main", "default")
};

(async () => {
  rebaseForceApp(true);
  var manifest = "";
  var salesforceAlias = "";

  // TODO retrieve
  // TODO mover para a pasta correta: alias / manifestName
  // TODO copiar manifest para a pasta correta

  rebaseForceApp(false);
})();

function rebaseForceApp(isBefore: Boolean) {
  if (isBefore && !Fs.existsSync(paths.defaultDir)) {
    Fs.mkdirSync(paths.defaultDir, { recursive: true });
  }

  var oldPath = isBefore ? paths.forceApp : paths.tempForceApp;
  var newPath = isBefore ? paths.tempForceApp : paths.forceApp;

  if (!isBefore) {
    Fs.rmSync(paths.forceApp, { recursive: true });
  }

  if (Fs.existsSync(oldPath) && !Fs.existsSync(newPath)) {
    Fs.renameSync(oldPath, newPath);
    console.log(`Renamed "${oldPath}" to: "${newPath}"`);
  }

  if (isBefore) {
    Fs.mkdirSync(paths.defaultDir, { recursive: true });
  }
}

// var manifestFile: string,
//   downloadDir = Utils.defaultPackageDirectorie();

// async function executeRetrieve(manifestFile: string, orgAlias: string) {
//   var targetOrg: string = <string>process.env[orgAlias];
//   infoLogger.info("Retrieving data from " + targetOrg);

//   var sfdxCommand = `sfdx force:source:retrieve -x="${manifestFile}" -u="${targetOrg}"`;
//   defaultLogger.trace("command ", `'${sfdxCommand}'`);

//   var destDir = Path.join("retrieved", targetOrg);
//   defaultLogger.trace(`Ouput will be saved at ${destDir}`);

//   try {
//     defaultLogger.trace(`Executing SFDX command`);

//     const sfdxProcess = ChildProcess.exec(sfdxCommand, async (e: any, sOut: any, sErr: any) => {
//       // TODO Better logs
//       if (!Fs.existsSync("retrieved")) Fs.mkdirSync("retrieved");
//       if (Fs.existsSync(destDir)) Fs.rmSync(destDir, { recursive: true });

//       infoLogger.info("Moving files of " + downloadDir + " to " + destDir);

//       Fs.moveSync(downloadDir, destDir);
//       Fs.copyFileSync(manifestFile, Path.join(destDir, 'package.xml'));

//       infoLogger.info("Files moved to " + destDir);

//       await removeProfilesUserPermissions(Path.join(destDir, 'profiles'))
//     });

//     //@ts-ignore
//     sfdxProcess.stdout.on("data", (data) => {
//       for (var i of data.split('\n'))
//         if (i && i.trim() != '') sfdxLogger.info(i);
//     });
//   } catch (error) {
//     defaultLogger.error("SFDX process error: " + error)
//   }
// }

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
