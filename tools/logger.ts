import * as Fs from "fs-extra";
import * as Path from "path";
import * as paths from "./paths";
import * as utils from "./utils";

interface setFileNameOptions {
  filename?: string;
}

class LoggerController {
  private filename: string = "";
  private path: string = "";
  private allowBucket = true;
  private logBucket: Array<string> = [];

  constructor() {
    try {
      Fs.rmSync(paths.logs, { recursive: true });
    } catch (error) {}
  }

  public setFileName(options?: setFileNameOptions) {
    let { filename } = options ?? {};

    if (filename != null && this.filename == "") {
      filename = utils.getTimeStamp(Path.basename(filename, Path.extname(filename))) + ".log";
      this.filename = filename;
      this.path = Path.join(paths.logs, filename);

      if (!Fs.existsSync(paths.logs)) Fs.mkdirSync(paths.logs, { recursive: true });

      if (this.logBucket.length > 0) Fs.writeFileSync(this.path, this.logBucket.join("\n"));

      this.allowBucket = false;
    }
  }

  public log(options: { message: string; prompt?: boolean }) {
    let { message, prompt } = options;

    if (prompt == null) prompt = false;

    if (this.allowBucket) this.logBucket.push(message);
    else Fs.appendFileSync(this.path, "\n" + message);

    if (prompt) console.log(message);
  }

  public error(options: { message: string; throwError?: Boolean }) {
    this.log({ message: "ERROR: " + options.message, prompt: true });

    if (options.throwError) throw new Error(options.message);
  }

  public methodResponse(methodPath: string, methodValue: any) {
    this.log({ message: `${methodPath}: ${JSON.stringify(methodValue)}`, prompt: false });
  }
}

export const logger = new LoggerController();

export function getLogger(options?: setFileNameOptions) {
  logger.setFileName(options);
  return logger;
}
