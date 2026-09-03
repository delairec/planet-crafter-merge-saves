import {ValidationIssue} from "./ValidationIssue";

export interface MergeResultPresenterPort {
  presentMergeSucceeded(fileName: string, content: string): void;

  presentSaveFilesInvalid(saveAErrors: ValidationIssue[], saveBErrors: ValidationIssue[]): void;
}
