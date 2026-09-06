import {Accessor, createEffect, JSX, Resource, Show} from "solid-js";
import Spinner from "~/components/structure/Spinner";
import {sectionLoadingErrorMessage} from "~/messages/sectionStateMessages";

interface SectionStateProps<ViewModel> {
  title: string;
  resource: Resource<ViewModel>;
  children: (viewModel: Accessor<ViewModel>) => JSX.Element;
}

/**
 * Renders a save section according to the state of the resource feeding it: the section title with a
 * spinner while it loads, the title with a generic message when the controller rejected, and the
 * section content once the view model is resolved — never a title on its own.
 */
export default function SectionState<ViewModel>(props: SectionStateProps<ViewModel>) {
  createEffect(() => {
    if (props.resource.error) {
      console.error(props.resource.error);
    }
  });

  return (
    <Show when={!props.resource.loading} fallback={<><h3>{props.title}</h3><Spinner/></>}>
      <Show when={!props.resource.error}
            fallback={<><h3>{props.title}</h3><p class="text-color-danger">{sectionLoadingErrorMessage}</p></>}>
        <Show when={props.resource()}>
          {(viewModel) => props.children(viewModel)}
        </Show>
      </Show>
    </Show>
  );
}
