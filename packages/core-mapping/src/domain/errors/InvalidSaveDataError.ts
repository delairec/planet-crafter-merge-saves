export class InvalidSaveDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSaveDataError';
  }
}
