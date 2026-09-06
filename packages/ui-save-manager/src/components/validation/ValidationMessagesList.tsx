import {
  hideValidationMessagesDetails,
  showValidationMessagesDetails
} from "~/messages/validationMessages";
import {createSignal, Show} from "solid-js";

/**
 * Errors are technical messages produced by the validation engine, so they stay folded behind a
 * summary and keep the code typography. Warnings are sentences written for the user and are shown
 * as plain text.
 */
export default function ValidationMessagesList(props: {
  title: string,
  severity: 'danger' | 'warning',
  messages: string[],
  foldable?: boolean,
  monospaced?: boolean
}) {

  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  const messageItems = () => props.messages.map((message) =>
    <li>{props.monospaced ? <code>{message}</code> : message}</li>);

  return <>
    <p class={`text-color-${props.severity}`}>{props.title}</p>
    <Show when={props.foldable} fallback={<ul>{messageItems()}</ul>}>
      <details>
        <summary onClick={() => setIsOpen((previous) => !previous)}>
          {isOpen() ? hideValidationMessagesDetails : showValidationMessagesDetails}
        </summary>
        <ul>{messageItems()}</ul>
      </details>
    </Show>
  </>
}
