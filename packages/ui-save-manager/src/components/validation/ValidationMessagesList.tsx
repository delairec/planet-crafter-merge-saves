import {
  hideValidationMessagesDetails,
  showValidationMessagesDetails
} from "~/messages/validationMessages";
import {createSignal} from "solid-js";

export default function ValidationMessagesList(props: {
  title: string,
  severity: 'danger' | 'warning',
  messages: string[]
}) {

  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  return <>
    <p class={`text-color-${props.severity}`}>{props.title}</p>
    <details>
      <summary onClick={() => setIsOpen((previous) => !previous)}>
        {isOpen() ? hideValidationMessagesDetails : showValidationMessagesDetails}
      </summary>
      <ul>
        {props.messages.map((message) => <li><code>{message}</code></li>)}
      </ul>
    </details>
  </>
}
