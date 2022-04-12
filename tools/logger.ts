import * as Fs from "fs-extra";
import { type } from "os";
import * as Path from "path";
import * as paths from "./paths";
import * as utils from "./utils";

var colors = require("colors");

type ErrorsTypes = "FATAL_ERROR" | "METHOD_EXIT" | "ERROR" | "INFO" | "WARNING";

function colorizeLog(logType: ErrorsTypes, logMessage: string) {
  switch (logType) {
    case "METHOD_EXIT":
      return logMessage;
    case "ERROR":
      return colors.red(logMessage);
    case "FATAL_ERROR":
      return colors.red(logMessage);
    case "WARNING":
      return colors.yellow(logMessage);
    case "INFO":
      return colors.green(logMessage);
    default:
      return logMessage;
  }
}

interface setFileNameOptions {
  filename?: string;
}

interface LogOptions {
  message: string;
  type?: ErrorsTypes;
  prompt?: Boolean;
}

class LoggerController {
  private filename: string = "";
  private _path: string = "";
  private allowBucket = true;
  private logBucket: Array<string> = [];

  constructor() {}

  get hasPath() {
    return this._path != "";
  }

  get path() {
    return this._path;
  }

  public setFileName(options?: setFileNameOptions) {
    let { filename } = options ?? {};

    if (filename != null && this.filename == "") {
      filename = utils.getTimeStamp(Path.basename(filename, Path.extname(filename))) + ".log";
      this.filename = filename;
      this._path = Path.join(paths.logs, filename);

      if (!Fs.existsSync(paths.logs)) Fs.mkdirSync(paths.logs, { recursive: true });

      if (this.logBucket.length > 0) Fs.writeFileSync(this._path, this.logBucket.join("\n"));

      this.allowBucket = false;
    }
  }

  public log(options: LogOptions) {
    let promptTypes: Array<ErrorsTypes> = ["FATAL_ERROR", "ERROR", "WARNING"];
    let throwErrorTypes: Array<ErrorsTypes> = ["FATAL_ERROR", "ERROR"];

    let { message, prompt, type } = options;
    type = type ?? "INFO";
    if (prompt == null) prompt = false;

    let logFileEntry = `${this.getTimeStamp()} | ${type} | ${message}`;
    let consoleMessage = `${type} | ${colorizeLog(type, message)}`;

    // * Add data to log file
    if (this.allowBucket) this.logBucket.push(logFileEntry);
    else if (this._path != "") Fs.appendFileSync(this._path, `${this.allowBucket != null ? "\n" : ""}${logFileEntry}`);

    // * prompt log message
    if (prompt || promptTypes.includes(type)) console.log(consoleMessage);

    if (throwErrorTypes.includes(type)) throw new Error(colorizeLog(type, message));
  }
  public methodResponse(methodPath: string, methodValue: any) {
    this.log({ message: `${methodPath} => ${JSON.stringify(methodValue)}`, prompt: false, type: "METHOD_EXIT" });
  }

  private getTimeStamp() {
    const prettyNum = (num: Number) => {
      return num < 10 ? "0" + num : num;
    };
    let now = new Date();

    let year = now.getFullYear();
    let mounth = prettyNum(now.getMonth() + 1);
    let day = prettyNum(now.getDate());
    let hour = prettyNum(now.getHours());
    let minutes = prettyNum(now.getMinutes());
    let seconds = prettyNum(now.getSeconds());

    return `${year}-${mounth}-${day} ${hour}:${minutes}:${seconds}`;
  }

  public error(message: string, throwError: Boolean = false) {
    this.log({ message: message, prompt: true, type: throwError ? "FATAL_ERROR" : "ERROR" });
  }

  public info(message: string, prompt: boolean = false) {
    return this.log({ message: message, prompt: prompt, type: "INFO" });
  }

  public failedProcessEnded(error: any) {
    this.info("Fatal error finished the process: " + error);

    if (this.hasPath) console.error(`Read full log at "${logger.path}"`);
  }
}

export const logger = new LoggerController();

// TODO "METHOD_EXIT", "WARNING";
