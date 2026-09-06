import type {ParsedSections} from "shared-save-processing/gameDefinitions";

/**
 * Parsing reports the errors it hits while reading the sections. Format adaptations are not
 * reported here: validation runs before parsing in every flow and is the single source of warnings
 * (see `SaveValidationResult`).
 */
export interface ParsedSaveSections {
  sections: ParsedSections;
  errors: string[];
}

export interface SaveSectionsParserPort {
  parse(content: string): ParsedSaveSections;
}
