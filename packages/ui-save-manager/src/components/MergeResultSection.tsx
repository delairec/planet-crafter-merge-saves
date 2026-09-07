import {Accessor, createEffect, createSignal, onCleanup, Show} from 'solid-js';
import {MergeResultViewModel} from 'core-mapping/presentation/viewModels/MergeResultViewModel';
import {
  mergeResultSectionDownloadLinkLabel,
  mergeResultSectionFileCreatedMessage,
  mergeResultSectionSaveAInvalidMessage,
  mergeResultSectionSaveAWarningsTitle,
  mergeResultSectionSaveBInvalidMessage,
  mergeResultSectionSaveBWarningsTitle,
  mergeResultSectionSuccessMessage
} from '~/messages/mergeResultSectionMessages';
import ValidationMessagesList from "~/components/validation/ValidationMessagesList";

interface MergeResultSectionProps {
  result: Accessor<MergeResultViewModel | null>;
}

export default function MergeResultSection(props: MergeResultSectionProps) {
  const [downloadUrl, setDownloadUrl] = createSignal<string | null>(null);
  let downloadFileUrl: string | null = null;

  const isSuccess = () => props.result()?.status === 'success';
  const isInvalid = () => props.result()?.status === 'validationError';

  createEffect(() => {
    const result = props.result();

    if (downloadFileUrl) {
      URL.revokeObjectURL(downloadFileUrl);
    }

    downloadFileUrl = result?.status === 'success' ? URL.createObjectURL(new Blob([result.content], {type: 'application/json'})) : null;
    setDownloadUrl(downloadFileUrl);
  });

  onCleanup(() => {
    if (downloadFileUrl) {
      URL.revokeObjectURL(downloadFileUrl);
    }
  });

  return (
    <Show when={props.result()}>
      <Show when={props.result()!.saveAWarningMessages.length > 0}>
        <ValidationMessagesList title={mergeResultSectionSaveAWarningsTitle} severity="warning"
                                messages={props.result()!.saveAWarningMessages}/>
      </Show>
      <Show when={props.result()!.saveBWarningMessages.length > 0}>
        <ValidationMessagesList title={mergeResultSectionSaveBWarningsTitle} severity="warning"
                                messages={props.result()!.saveBWarningMessages}/>
      </Show>

      <Show when={isSuccess()}>
        <p class="text-color-success">{mergeResultSectionSuccessMessage}</p>
        <p>{mergeResultSectionFileCreatedMessage} <code>{props.result()!.fileName}</code> <a class="button-link"
                                                                                             href={downloadUrl() ?? undefined}
                                                                                             download={props.result()!.fileName}>{mergeResultSectionDownloadLinkLabel}</a>
        </p>
      </Show>

      <Show when={isInvalid()}>
        <div>
          <Show when={props.result()!.saveAErrorMessages.length > 0}>
            <ValidationMessagesList title={mergeResultSectionSaveAInvalidMessage} severity="danger"
                                    messages={props.result()!.saveAErrorMessages}/>
          </Show>
          <Show when={props.result()!.saveBErrorMessages.length > 0}>
            <ValidationMessagesList title={mergeResultSectionSaveBInvalidMessage} severity="danger"
                                    messages={props.result()!.saveBErrorMessages}/>
          </Show>
        </div>
      </Show>
    </Show>
  );
}
