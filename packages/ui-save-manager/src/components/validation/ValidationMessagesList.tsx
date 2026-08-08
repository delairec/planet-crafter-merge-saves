import {showValidationMessagesDetails} from "../../../../util-messages/validationMessages";

export default function ValidationMessagesList(props: {
  title: string,
  severity: 'danger' | 'warning',
  messages: string[]
}) {
  return <>
    <p class={`text-color-${props.severity}`}>{props.title}</p>
    <details>
      <summary>{showValidationMessagesDetails}</summary>
      <ul>
        {props.messages.map((message) => <li><code>{message}</code></li>)}
      </ul>
    </details>
  </>
}