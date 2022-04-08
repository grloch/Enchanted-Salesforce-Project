import * as Fs from "fs-extra";
import { getLogger } from "./logger";
const logger = getLogger();

export function getTimeStamp(text?: string) {
  function prettyNum(num: number) {
    return num < 10 ? `0${num}` : num + "";
  }
  let now = new Date();

  let year = now.getFullYear() + "",
    mounth = prettyNum(now.getMonth()),
    day = prettyNum(now.getDate()),
    hour = prettyNum(now.getHours()),
    minute = prettyNum(now.getMinutes()),
    second = prettyNum(now.getSeconds());

  return `${now.getTime()}${text != null ? `___${text}` : ""}___${year}-${mounth}-${day}___${hour}-${minute}-${second}`;
}

export function deletePath(deletedPath: string) {
  if (Fs.existsSync(deletedPath)) {
    Fs.rmSync(deletedPath, { recursive: true });
    // logger.methodResponse("utils.ts/deletePath", true);
  } else {
    // logger.methodResponse("utils.ts/deletePath", false);
  }
}

export function movePath(oldPath: string, newPath: string) {
  Fs.moveSync(oldPath, newPath);
  // logger.methodResponse("utils.ts/movePath", { oldPath, newPath });
}

export function copyFile(oldPath: string, newPath: string) {
  Fs.copyFileSync(oldPath, newPath);
  // logger.methodResponse("utils.ts/copyFile", { oldPath, newPath });
}