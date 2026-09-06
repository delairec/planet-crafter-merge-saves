import {mergeSaveSections} from "../domain/rules/merge/mergeSaveSections";
import {MergedSaveSections} from "../domain/rules/merge/MergedSaveSections";
import {resolveIdConflicts} from "../domain/rules/merge/resolveIdConflicts";
import {buildMergedFileName} from "./buildMergedFileName";
import {SaveFilesMergerPort} from "../application/ports/SaveFilesMergerPort";
import {createMergedSaveValueObject, MergedSaveValueObject} from "../domain/valueObjects/MergedSaveValueObject";
import {parseSaveSections} from "shared-save-processing/parseSaveSections.js";
import {serializeSave} from "shared-save-processing/serializeSave.js";

export class SaveFilesMergerService implements SaveFilesMergerPort {
  merge(fileNameA: string, contentA: string, fileNameB: string, contentB: string, saveDisplayName?: string): MergedSaveValueObject {
    const fileName = buildMergedFileName(fileNameA, fileNameB);
    const resolvedSaveDisplayName = saveDisplayName ?? fileName.replace(/\.json$/, '');

    const parsedSaveA = parseSaveSections(contentA);
    const parsedSaveB = parseSaveSections(contentB);

    const mergedSections = mergeSaveSections(parsedSaveA.sections, parsedSaveB.sections, resolvedSaveDisplayName);
    const content = serialize(resolveIdConflicts(mergedSections));

    return createMergedSaveValueObject({fileName, content});
  }
}

function serialize(mergedSections: MergedSaveSections): string {
  return serializeSave({
    metadata: [mergedSections.globalMetadata],
    terraformationLevels: [...mergedSections.terraformationLevels],
    players: [...mergedSections.players.fromSaveA, ...mergedSections.players.fromSaveB],
    worldObjects: [...mergedSections.worldObjects.fromSaveA, ...mergedSections.worldObjects.fromSaveB],
    inventories: [...mergedSections.inventories.fromSaveA, ...mergedSections.inventories.fromSaveB],
    statistics: mergedSections.statistics ? [mergedSections.statistics] : [],
    mailboxes: [...mergedSections.mailboxes],
    storyEvents: [...mergedSections.storyEvents],
    saveConfigurations: mergedSections.saveConfiguration ? [mergedSections.saveConfiguration] : [],
    worldEvents: [...mergedSections.worldEvents],
  });
}
