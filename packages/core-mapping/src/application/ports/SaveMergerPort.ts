import {MergedSaveValueObject} from "../../domain/valueObjects/MergedSaveValueObject";

export interface SaveMergerPort {
  merge(fileNameA: string, contentA: string, fileNameB: string, contentB: string): MergedSaveValueObject;
}
