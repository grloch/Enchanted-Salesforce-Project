export function log(message: string) {
  console.log(message);
}

export function error(message: string) {
  throw new Error(message);
}
