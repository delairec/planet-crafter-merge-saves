import {spinnerLoadingLabel} from "~/messages/spinnerMessages";

interface SpinnerProps {
  label?: string;
}

export default function Spinner(props: SpinnerProps) {
  return (
    <span class="spinner-container" role="status">
      <span class="spinner" aria-hidden="true"/>
      <span>{props.label ?? spinnerLoadingLabel}</span>
    </span>
  );
}
