import * as Path from "path";

export const forceApp = "force-app",
  tempForceApp = "_tempForceApp",
  defaultDir = Path.join("force-app", "main", "default"),
  sfdxConfig = Path.join(process.cwd(), ".sfdx", "sfdx-config.json"),
  manifest = "manifest",
  packages = Path.join("manifest", "packages"),
  logs = Path.join("logs", "project"),
  mergedPackages = Path.join(manifest, "merged"),
  defaultPackage = Path.join("src", "defaultPackage.xml");
