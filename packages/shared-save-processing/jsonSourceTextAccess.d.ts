/**
 * Source text access of `JSON.parse` (ES2025): the reviver receives, in a third parameter, the
 * exact text the document holds for the value being revived. Node 24, Bun 1.3, Chromium, Firefox
 * and WebKit all implement it; TypeScript 7.0.2 still declares a two-parameter reviver
 * (`lib.es5.d.ts`). Delete this declaration as soon as the TypeScript libraries ship the typing.
 */
interface JSON {
  parse(
    text: string,
    reviver: (this: unknown, key: string, value: unknown, context: {source?: string}) => unknown
  ): unknown;
}
