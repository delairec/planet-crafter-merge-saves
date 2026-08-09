import {merge} from "cli-merge/merge.js";
import {resolveIdConflicts} from "../../../util-parsing/resolveIdConflicts.js";
import {buildMergedFileName} from "../../../util-parsing/buildMergedFileName.js";
import {SaveMergerPort} from "../application/ports/SaveMergerPort";
import {MergedSaveValueObject} from "../domain/valueObjects/MergedSaveValueObject";

export class SaveFilesMergerService implements SaveMergerPort {
  merge(fileNameA: string, contentA: string, fileNameB: string, contentB: string): MergedSaveValueObject {
    const fileName = buildMergedFileName(fileNameA, fileNameB);
    const saveDisplayName = fileName.replace(/\.json$/, '');

    const {mergeSaves, saveAWorldObjectIds} = merge(contentA, contentB, saveDisplayName);
    const mergedSections = mergeSaves();
    const content = resolveIdConflicts(mergedSections, saveAWorldObjectIds);

    return {fileName, content};
  }
}
