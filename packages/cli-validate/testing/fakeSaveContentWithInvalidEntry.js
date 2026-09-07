import {PLAYERS_SECTION_INDEX} from 'shared-save-processing/gameDefinitions';
import {VALID_SAVE_CONTENT} from './fakeValidSaveContent.js';

const BROKEN_ENTRY = '{ broken entry';

const sections = VALID_SAVE_CONTENT.split('@');
sections[PLAYERS_SECTION_INDEX] = `${sections[PLAYERS_SECTION_INDEX]}|\n${BROKEN_ENTRY}`;

export const SAVE_CONTENT_WITH_INVALID_ENTRY = sections.join('@');
