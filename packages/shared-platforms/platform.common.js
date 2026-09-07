import fs from 'node:fs/promises';
import {basename, join} from 'node:path';
import process from 'node:process';

export function readDirectory(path) {
  return fs.readdir(path);
}

export function joinPath(...segments) {
  return join(...segments);
}

export function getBasename(path, extension) {
  return basename(path, extension);
}

export function exitProcess(code) {
  return process.exit(code);
}

export function getCliArguments() {
  return process.argv;
}
