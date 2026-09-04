import {InvalidSaveDataError} from "./InvalidSaveDataError";

export function assertFiniteNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new InvalidSaveDataError(`${field} must be a finite number, received ${String(value)}`);
  }
  return value;
}

export function assertOptionalFiniteNumber(value: unknown, field: string): number | undefined {
  return value === undefined ? undefined : assertFiniteNumber(value, field);
}

export function assertNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new InvalidSaveDataError(`${field} must be a non-empty string, received ${String(value)}`);
  }
  return value;
}

export function assertOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new InvalidSaveDataError(`${field} must be a string, received ${String(value)}`);
  }
  return value;
}

export function assertArray<Item>(value: unknown, field: string): Item[] {
  if (!Array.isArray(value)) {
    throw new InvalidSaveDataError(`${field} must be an array, received ${String(value)}`);
  }
  return value as Item[];
}
