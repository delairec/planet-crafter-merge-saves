import {ParsedSections} from "shared-save-processing/gameDefinitions";

export interface ParsedSaveSections {
  sections: ParsedSections;
  errors: string[];
  warnings: string[];
}

export interface SaveSectionsParserPort {
  parse(content: string): ParsedSaveSections;
}
