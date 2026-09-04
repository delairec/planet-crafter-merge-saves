export interface MergeSaveFilesRequest {
  fileNameA: string;
  contentA: string;
  fileNameB: string;
  contentB: string;
  saveDisplayName?: string;
}
