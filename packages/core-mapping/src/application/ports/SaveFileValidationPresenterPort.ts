export interface SaveFileValidationPresenterPort {
  presentValidSaveFile(): void;

  presentInvalidSaveFile(errorMessages: string[]): void;
}
