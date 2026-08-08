import {createSignal, onMount, Show} from 'solid-js';
import PlayersSection from '../components/PlayersSection';
import GlobalProgressionSection from "../components/GlobalProgressionSection";
import TerraformationLevelsSection from '../components/TerraformationLevelsSection';
import {parseSaveSections} from "../../../util-parsing/parseSaveSections";
import SaveConfigurationSection from "../components/SaveConfigurationSection";
import {ParsedSections} from "../../../util-types/gameDefinitions";
import EnergyLevelsSection from "~/components/EnergyLevelsSection";
import MergeSection from "~/components/MergeSection";
import MergeResultSection from "~/components/MergeResultSection";
import {MergeResultViewModel} from "../../../util-mapping/presentation/viewModels/MergeResultViewModel";
import {hasJsonExtension} from "../../../util-parsing/hasJsonExtension";
import {SaveValidatorService} from "../../../util-mapping/infrastructure/SaveValidatorService";
import {
  displayRouteDisplayTitle,
  displayRouteErrorsTitle,
  displayRouteLoadingLabel,
  displayRouteParsedDataPlaceholder,
  displayRouteSubmitButtonLabel,
  displayRouteVisualizationTitle,
  displayRouteWarningsTitle
} from "../../../util-messages/displayRouteMessages";
import {invalidExtensionErrorMessage} from "../../../util-messages/validationMessages";
import ValidationMessagesList from "~/components/validation/ValidationMessagesList";
import HomeDisclaimer from "~/components/HomeDisclaimer";

export default function Home() {
  const [file, setFile] = createSignal<File | null>(null);
  const [sections, setSections] = createSignal<ParsedSections | null>(null);
  const [errors, setErrors] = createSignal<string[]>([]);
  const [warnings, setWarnings] = createSignal<string[]>([]);
  const [isReady, setIsReady] = createSignal<boolean>(false);
  const [mergeResult, setMergeResult] = createSignal<MergeResultViewModel | null>(null);

  onMount(() => {
    setIsReady(true);
  });

  const resetDisplayFields = () => {
    setErrors([]);
    setWarnings([]);
    setSections(null);
  }

  const handleFileChange = (event: Event) => {
    resetDisplayFields();

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      setFile(input.files[0]);
    }
  };

  const handleSubmit = () => {
    resetDisplayFields();
    const fileInput = file();

    if (fileInput) {
      if (!hasJsonExtension(fileInput.name)) {
        setErrors([invalidExtensionErrorMessage]);
        setWarnings([]);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const validation = new SaveValidatorService().validate(content);
        if (!validation.isValid) {
          setSections(null);
          setErrors(validation.errorMessages);
          setWarnings([]);
          return;
        }

        const {sections, errors, warnings} = parseSaveSections(content);
        setSections(sections);
        setErrors(errors);
        setWarnings(warnings);
      };
      reader.readAsText(fileInput);
    }
  };

  const handleSubmitMerge = (result: MergeResultViewModel) => {
    resetDisplayFields();

    setMergeResult(result);
  }

  return (
    <Show when={isReady()} fallback={<p class="text-color-muted">{displayRouteLoadingLabel}</p>}>
      <main>

        <HomeDisclaimer/>

        <h2>{displayRouteDisplayTitle}</h2>
        <input type="file" accept="application/json" onChange={handleFileChange}/>
        <button onClick={handleSubmit} disabled={!file()}>{displayRouteSubmitButtonLabel}</button>

        <MergeSection onMergeResult={handleSubmitMerge}/>

        <h2>{displayRouteVisualizationTitle}</h2>
        <MergeResultSection result={mergeResult}/>

        <Show when={!errors().length && !sections() && !mergeResult()}>
          <p class="text-color-muted">{displayRouteParsedDataPlaceholder}</p>
        </Show>

        <Show when={errors().length}>
          <ValidationMessagesList title={displayRouteErrorsTitle} severity="danger" messages={errors()}/>
        </Show>

        <Show when={warnings().length}>
          <ValidationMessagesList title={displayRouteWarningsTitle} severity="warning" messages={warnings()}/>
        </Show>

        <Show when={sections() && !errors().length}>
          <div class="grid-container">
            <SaveConfigurationSection sections={() => sections()!}/>
            <GlobalProgressionSection sections={() => sections()!}/>
          </div>
          <EnergyLevelsSection sections={() => sections()!}/>
          <TerraformationLevelsSection sections={() => sections()!}/>
          <PlayersSection sections={() => sections()!}/>
        </Show>
      </main>
    </Show>
  );
}
