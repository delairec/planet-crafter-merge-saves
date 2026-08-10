export interface MergeResultPresenterPort {
  presentMergeSucceeded(fileName: string, content: string): void;

  presentSaveFilesInvalid(saveAErrorMessages: string[], saveBErrorMessages: string[]): void;
}
