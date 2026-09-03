import {MergedSaveValueObject} from "../../domain/valueObjects/MergedSaveValueObject";

export interface SaveFilesMergerPort {
  merge(fileNameA: string, contentA: string, fileNameB: string, contentB: string, saveDisplayName?: string): MergedSaveValueObject;
}
