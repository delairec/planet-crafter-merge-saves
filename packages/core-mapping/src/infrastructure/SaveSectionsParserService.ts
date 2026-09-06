import {parseSaveSections} from "shared-save-processing/parseSaveSections.js";
import type {ParsedSaveSections, SaveSectionsParserPort} from "../application/ports/SaveSectionsParserPort.ts";

export class SaveSectionsParserService implements SaveSectionsParserPort {
  parse(content: string): ParsedSaveSections {
    const {sections, errors} = parseSaveSections(content);

    return {sections, errors};
  }
}
