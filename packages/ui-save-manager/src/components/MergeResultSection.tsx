import {Accessor, createEffect, createSignal, onCleanup, Show} from 'solid-js';
import {MergeResultViewModel} from '../../../util-mapping/presentation/viewModels/MergeResultViewModel';
import {
  mergeResultSectionSuccessPrefix,
  mergeResultSectionDownloadLinkLabel,
  mergeResultSectionSaveAInvalidMessage,
  mergeResultSectionSaveBInvalidMessage,
  mergeResultSectionShowDetailsLabel
} from '../../../util-messages/mergeResultSectionMessages';

interface MergeResultSectionProps {
  result: Accessor<MergeResultViewModel | null>;
}

export default function MergeResultSection(props: MergeResultSectionProps) {
  const [downloadUrl, setDownloadUrl] = createSignal<string | null>(null);
  let previousUrl: string | null = null;

  createEffect(() => {
    const result = props.result();

    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    previousUrl = result?.status === 'success' ? URL.createObjectURL(new Blob([result.content], {type: 'application/json'})) : null;
    setDownloadUrl(previousUrl);
  });

  onCleanup(() => {
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }
  });

  return (
    <Show when={props.result()}>
      <Show when={props.result()!.status === 'success'}>
        <p>{mergeResultSectionSuccessPrefix}{props.result()!.fileName}</p>
        <p>
          <a class="button-link" href={downloadUrl() ?? undefined} download={props.result()!.fileName}>{mergeResultSectionDownloadLinkLabel}</a>
        </p>
      </Show>

      <Show when={props.result()!.status === 'validationError'}>
        <div>
          <Show when={props.result()!.saveAErrorMessages.length > 0}>
            <p class="text-color-muted">{mergeResultSectionSaveAInvalidMessage}</p>
            <details>
              <summary>{mergeResultSectionShowDetailsLabel}</summary>
              <ul>
                {props.result()!.saveAErrorMessages.map((message) => <li>{message}</li>)}
              </ul>
            </details>
          </Show>
          <Show when={props.result()!.saveBErrorMessages.length > 0}>
            <p class="text-color-muted">{mergeResultSectionSaveBInvalidMessage}</p>
            <details>
              <summary>{mergeResultSectionShowDetailsLabel}</summary>
              <ul>
                {props.result()!.saveBErrorMessages.map((message) => <li>{message}</li>)}
              </ul>
            </details>
          </Show>
        </div>
      </Show>
    </Show>
  );
}
