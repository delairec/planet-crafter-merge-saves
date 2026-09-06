import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {SaveWarningCode} from "shared-save-processing/normalizeRawSections.js";

export interface ParsedSaveSections {
  sections: ParsedSections;
  errors: string[];
  warnings: SaveWarningCode[];
}

export interface SaveSectionsParserPort {
  parse(content: string): ParsedSaveSections;
}
