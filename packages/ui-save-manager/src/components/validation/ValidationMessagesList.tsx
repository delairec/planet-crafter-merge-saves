import {
  hideValidationMessagesDetails,
  showValidationMessagesDetails
} from "~/messages/validationMessages";
import {createSignal, Show} from "solid-js";
import {SaveValidationErrorViewModel} from "core-mapping/presentation/viewModels/SaveFileValidationViewModel";

/**
 * A validation error knows where in the save it was found; a warning concerns the save as a whole
 * and is passed as a plain sentence.
 */
export type ValidationMessage = string | SaveValidationErrorViewModel;

function normalizeValidationMessage(entry: ValidationMessage): SaveValidationErrorViewModel {
  if (typeof entry === 'string') {
    return {message: entry, location: null};
  }
  return entry;
}

export default function ValidationMessagesList(props: {
  title: string,
  severity: 'danger' | 'warning',
  messages: ValidationMessage[]
}) {

  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  return <>
    <p class={`text-color-${props.severity}`}>{props.title}</p>
    <details>
      <summary onClick={() => setIsOpen((previous) => !previous)}>
        {isOpen() ? hideValidationMessagesDetails : showValidationMessagesDetails}
      </summary>
      <ul>
        {props.messages.map(normalizeValidationMessage).map(({message, location}) => <li>
          <Show when={location}>
            <span class="text-color-muted">{location}</span>{' '}
          </Show>
          <code>{message}</code>
        </li>)}
      </ul>
    </details>
  </>
}
