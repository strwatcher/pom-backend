export class DrizzleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DrizzleError";
  }
}
