import {mergeParsedSaveSections} from "../domain/rules/merge/mergeParsedSaveSections";
import {resolveIdConflicts} from "../domain/rules/merge/resolveIdConflicts";
import {buildMergedFileName} from "../domain/rules/merge/buildMergedFileName";
import {SaveMergerPort} from "../application/ports/SaveMergerPort";
import {MergedSaveValueObject} from "../domain/valueObjects/MergedSaveValueObject";
import {parseSaveSections} from "shared-save-processing/parseSaveSections.js";

export class SaveFilesMergerService implements SaveMergerPort {
  merge(fileNameA: string, contentA: string, fileNameB: string, contentB: string): MergedSaveValueObject {
    const fileName = buildMergedFileName(fileNameA, fileNameB);
    const saveDisplayName = fileName.replace(/\.json$/, '');

    const parsedSaveA = parseSaveSections(contentA);
    const parsedSaveB = parseSaveSections(contentB);

    const {mergeSaves, saveAWorldObjectIds} = mergeParsedSaveSections(parsedSaveA, parsedSaveB, saveDisplayName);
    const mergedSections = mergeSaves();
    const content = resolveIdConflicts(mergedSections, saveAWorldObjectIds);

    return {fileName, content};
  }
}
