import {createSignal} from 'solid-js';
import {MergeSaveFilesController} from 'core-mapping/controllers/MergeSaveFilesController';
import {MergeResultViewModel} from 'core-mapping/presentation/viewModels/MergeResultViewModel';
import {
  mergeButtonLabel,
  mergeSectionSaveALabel,
  mergeSectionSaveBLabel,
  mergeSectionTitle
} from '~/messages/mergeSectionMessages';

interface MergeSectionProps {
  onMergeResult: (result: MergeResultViewModel) => void;
}

export default function MergeSection(props: MergeSectionProps) {
  const [fileA, setFileA] = createSignal<File | null>(null);
  const [fileB, setFileB] = createSignal<File | null>(null);

  function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  const handleMerge = async () => {
    const savedFileA = fileA();
    const savedFileB = fileB();
    if (!savedFileA || !savedFileB) {
      return;
    }

    const [contentA, contentB] = await Promise.all([readFileAsText(savedFileA), readFileAsText(savedFileB)]);
    const viewModel = MergeSaveFilesController.mergeSaveFiles(savedFileA.name, contentA, savedFileB.name, contentB);

    props.onMergeResult(viewModel);
  };

  return (
    <div>
      <div class="inline-block">
        <h2>{mergeSectionTitle}</h2>
        <p><label>{mergeSectionSaveALabel}<input type="file" accept="application/json"
                                                 onChange={(event) => setFileA(event.currentTarget.files?.[0] ?? null)}/></label>
        </p>
        <p><label>{mergeSectionSaveBLabel}<input type="file" accept="application/json"
                                                 onChange={(event) => setFileB(event.currentTarget.files?.[0] ?? null)}/></label>
        </p>
      </div>
      <button onClick={handleMerge} disabled={!fileA() || !fileB()}>{mergeButtonLabel}</button>
    </div>
  );
}
