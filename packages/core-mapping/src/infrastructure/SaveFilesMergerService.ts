import {merge} from "cli-merge/merge.js";
import {resolveIdConflicts} from "../../../util-parsing/resolveIdConflicts.js";
import {buildMergedFileName} from "../../../util-parsing/buildMergedFileName.js";
import {SaveMergerPort} from "../application/ports/SaveMergerPort";
import {MergedSaveValueObject} from "../domain/valueObjects/MergedSaveValueObject";
import {parseSaveSections} from "../../../util-parsing/parseSaveSections";

export class SaveFilesMergerService implements SaveMergerPort {
  merge(fileNameA: string, contentA: string, fileNameB: string, contentB: string): MergedSaveValueObject {
    const fileName = buildMergedFileName(fileNameA, fileNameB);
    const saveDisplayName = fileName.replace(/\.json$/, '');

    const parsedSaveA = parseSaveSections(contentA);
    const parsedSaveB = parseSaveSections(contentB);

    const {mergeSaves, saveAWorldObjectIds} = merge(parsedSaveA, parsedSaveB, saveDisplayName);
    const mergedSections = mergeSaves();
    const content = resolveIdConflicts(mergedSections, saveAWorldObjectIds);

    return {fileName, content};
  }
}
