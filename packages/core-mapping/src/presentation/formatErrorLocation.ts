import {saveSectionLabels} from "./messages/saveSectionLabels.js";

/**
 * Tells where in the save a validation error was found, as a fragment each delivery mechanism
 * places where it sees fit. An error concerning the whole file has no location and yields `null`.
 * A section with no label falls back to its bare index, so a location is never dropped.
 */
export function formatErrorLocation({section, entryIndex}: {section?: number, entryIndex?: number}): string | null {
  if (section === undefined) {
    return null;
  }

  const label = saveSectionLabels[section];
  const sectionLocation = label ? `${label} (section ${section})` : `section ${section}`;

  if (entryIndex === undefined) {
    return sectionLocation;
  }

  return `${sectionLocation}, entry ${entryIndex}`;
}
