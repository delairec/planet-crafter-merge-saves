export interface RuntimePlatform {
  readTextFile: (path: string) => Promise<string>;
  writeTextFile: (path: string, content: string) => Promise<void>;
  readDirectory: (path: string) => Promise<string[]>;
  joinPath: (...segments: string[]) => string;
  getBasename: (path: string, extension?: string) => string;
  exitProcess: (code: number) => never;
  getCliArguments: () => string[];
  isEntryPoint: (importMeta: { main?: boolean; url?: string }) => boolean;
}
