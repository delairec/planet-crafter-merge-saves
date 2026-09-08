import {
  hideValidationMessagesDetails,
  showValidationMessagesDetails,
  validationMessageLocationPrefix
} from "~/messages/validationMessages";
import {createSignal, Show} from "solid-js";
import {SaveValidationMessageViewModel} from "core-mapping/presentation/viewModels/SaveFileValidationViewModel";

export default function ValidationMessagesList(props: {
  title: string,
  severity: 'danger' | 'warning',
  messages: SaveValidationMessageViewModel[]
}) {

  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  return <>
    <p class={`text-color-${props.severity}`}>{props.title}</p>
    <details>
      <summary onClick={() => setIsOpen((previous) => !previous)}>
        {isOpen() ? hideValidationMessagesDetails : showValidationMessagesDetails}
      </summary>
      <ul>
        {props.messages.map(({message, location}) => <li class="validation-message">
          <code>
            {message}
            <Show when={location}>
              <span class="validation-message-location">{validationMessageLocationPrefix} {location}</span>
            </Show>
          </code>
        </li>)}
      </ul>
    </details>
  </>
}
