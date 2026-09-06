/// <reference lib="dom" />

import {Accessor, createSignal} from 'solid-js';
import {LoadAndValidateSaveFileController} from "core-mapping/controllers/LoadAndValidateSaveFileController";
import {MergeResultViewModel} from "core-mapping/presentation/viewModels/MergeResultViewModel";
import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {yieldToPaint} from "./yieldToPaint";

export interface LoadSaveFile {
  file: Accessor<File | null>;
  sections: Accessor<ParsedSections | null>;
  errors: Accessor<string[]>;
  warnings: Accessor<string[]>;
  mergeResult: Accessor<MergeResultViewModel | null>;
  isLoading: Accessor<boolean>;
  handleFileChange: (event: Event) => void;
  handleSubmit: () => Promise<void>;
  handleSubmitMerge: (result: MergeResultViewModel) => void;
}

export function useLoadSaveFile(): LoadSaveFile {
  const [file, setFile] = createSignal<File | null>(null);
  const [sections, setSections] = createSignal<ParsedSections | null>(null);
  const [errors, setErrors] = createSignal<string[]>([]);
  const [warnings, setWarnings] = createSignal<string[]>([]);
  const [mergeResult, setMergeResult] = createSignal<MergeResultViewModel | null>(null);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);

  const resetDisplayFields = () => {
    setErrors([]);
    setWarnings([]);
    setSections(null);
    setMergeResult(null);
  };

  const handleFileChange = (event: Event) => {
    resetDisplayFields();

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      setFile(input.files[0]);
    }
  };

  const handleSubmit = async () => {
    resetDisplayFields();
    const selectedFile = file();

    if (!selectedFile) {
      return;
    }

    setIsLoading(true);
    try {
      await yieldToPaint();

      const content = await selectedFile.text();
      const viewModel = await LoadAndValidateSaveFileController.loadAndValidateSaveFile(selectedFile.name, content);

      setSections(viewModel.sections);
      setErrors(viewModel.errorMessages);
      setWarnings(viewModel.warnings);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitMerge = (result: MergeResultViewModel) => {
    resetDisplayFields();
    setMergeResult(result);
  };

  return {
    file,
    sections,
    errors,
    warnings,
    mergeResult,
    isLoading,
    handleFileChange,
    handleSubmit,
    handleSubmitMerge
  };
}
