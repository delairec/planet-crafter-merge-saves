import {parseSaveSections} from "shared-save-processing/parseSaveSections.js";
import {ParsedSaveSections, SaveSectionsParserPort} from "../application/ports/SaveSectionsParserPort";

export class SaveSectionsParserService implements SaveSectionsParserPort {
  parse(content: string): ParsedSaveSections {
    return parseSaveSections(content);
  }
}
