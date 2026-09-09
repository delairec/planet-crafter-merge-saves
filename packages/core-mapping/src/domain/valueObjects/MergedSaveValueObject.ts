import {assertNonEmptyString} from "../errors/assertions";

export interface MergedSaveValueObject {
  readonly fileName: string;
  readonly content: string;
}

export function createMergedSaveValueObject(input: MergedSaveValueObject): MergedSaveValueObject {
  return {
    fileName: assertNonEmptyString(input.fileName, 'MergedSaveValueObject.fileName'),
    content: assertNonEmptyString(input.content, 'MergedSaveValueObject.content')
  };
}
