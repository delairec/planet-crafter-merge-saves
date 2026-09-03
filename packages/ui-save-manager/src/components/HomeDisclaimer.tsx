import {
  fileSafetyDisclaimerLabel,
  fileSafetyDisclaimerMessage,
  privacyDisclaimerLabel,
  privacyDisclaimerMessage,
  securityDisclaimerLabel,
  securityDisclaimerMessage
} from "~/messages/appMessages";
import {createSignal} from "solid-js";
import Emoji from "~/components/Emoji";

export default function HomeDisclaimer() {

  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  return (
    <details class="surface surface-warning">
      <summary class="text-center" onClick={() => setIsOpen((previous) => !previous)}>
        Click here to {isOpen() ? 'hide' : 'show'} privacy, security and file safety disclaimers
      </summary>
      <p>
        <strong><Emoji content="🥔"/> {privacyDisclaimerLabel}</strong>: {privacyDisclaimerMessage}
      </p>
      <p>
        <strong><Emoji content="🥔"/> {securityDisclaimerLabel}</strong>: {securityDisclaimerMessage}
      </p>
      <p>
        <strong><Emoji content="🥔"/> {fileSafetyDisclaimerLabel}</strong>: {fileSafetyDisclaimerMessage}
      </p>
    </details>)
}