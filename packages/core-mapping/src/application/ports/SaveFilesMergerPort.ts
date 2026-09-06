import type {MergedSaveValueObject} from "../../domain/valueObjects/MergedSaveValueObject.ts";

export interface SaveFilesMergerPort {
  merge(fileNameA: string, contentA: string, fileNameB: string, contentB: string, saveDisplayName?: string): MergedSaveValueObject;
}
