export type MergeOutcomeValueObject =
  | {status: 'success'; fileName: string; content: string}
  | {status: 'validationError'; saveAErrorMessages: string[]; saveBErrorMessages: string[]};

export interface MergeResultPresenterPort {
  present(outcome: MergeOutcomeValueObject): void;
}
