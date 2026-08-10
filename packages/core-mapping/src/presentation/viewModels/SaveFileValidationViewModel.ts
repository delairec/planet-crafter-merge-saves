export interface SaveFileValidationViewModel {
  status: 'idle' | 'valid' | 'invalid';
  errorMessages: string[];
}
