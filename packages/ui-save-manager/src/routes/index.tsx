import {createSignal, onMount, Show} from 'solid-js';
import PlayersSection from '../components/PlayersSection';
import GlobalProgressionSection from "../components/GlobalProgressionSection";
import TerraformationLevelsSection from '../components/TerraformationLevelsSection';
import SaveConfigurationSection from "../components/SaveConfigurationSection";
import EnergyLevelsSection from "~/components/EnergyLevelsSection";
import MergeSection from "~/components/MergeSection";
import MergeResultSection from "~/components/MergeResultSection";
import {
  displayRouteDisplayTitle,
  displayRouteErrorsTitle,
  displayRouteLoadingLabel,
  displayRouteParsedDataPlaceholder,
  displayRouteSubmitButtonLabel,
  displayRouteVisualizationTitle,
  displayRouteWarningsTitle
} from "~/messages/displayRouteMessages";
import ValidationMessagesList from "~/components/validation/ValidationMessagesList";
import Spinner from "~/components/structure/Spinner";
import HomeDisclaimer from "~/components/HomeDisclaimer";
import {useLoadSaveFile} from "~/lib/useLoadSaveFile";
import {useSectionViewModels} from "~/lib/useSectionViewModels";

export default function Home() {
  let fileInputElement!: HTMLInputElement;

  const [isReady, setIsReady] = createSignal<boolean>(false);
  onMount(() => setIsReady(true));

  const {
    file,
    sections,
    errors,
    warnings,
    mergeResult,
    isLoading,
    handleFileChange,
    handleSubmit,
    handleSubmitMerge
  } = useLoadSaveFile();
  const viewModels = useSectionViewModels(sections);

  const handleMergeResult: typeof handleSubmitMerge = (result) => {
    handleSubmitMerge(result);
    if (fileInputElement) {
      fileInputElement.value = '';
    }
  };

  return (
    <Show when={isReady()} fallback={<p class="text-color-muted">{displayRouteLoadingLabel}</p>}>
      <main>

        <HomeDisclaimer/>

        <h2>{displayRouteDisplayTitle}</h2>
        <input ref={fileInputElement} type="file" accept="application/json" onChange={handleFileChange}/>
        <button onClick={handleSubmit} disabled={!file() || isLoading()}>{displayRouteSubmitButtonLabel}</button>
        <Show when={isLoading()}>
          <Spinner/>
        </Show>

        <MergeSection onMergeResult={handleMergeResult}/>

        <h2>{displayRouteVisualizationTitle}</h2>

        <Show when={!errors().length && !sections() && !mergeResult()}>
          <p class="text-color-muted">{displayRouteParsedDataPlaceholder}</p>
        </Show>

        <MergeResultSection result={mergeResult}/>

        <Show when={errors().length}>
          <code>{file()?.name}</code>
          <ValidationMessagesList title={displayRouteErrorsTitle} severity="danger" messages={errors()}/>
        </Show>

        <Show when={warnings().length}>
          <code>{file()?.name}</code>
          <ValidationMessagesList title={displayRouteWarningsTitle} severity="warning" messages={warnings()}/>
        </Show>

        <Show when={sections() && !errors().length}>
          <div class="grid-container">
            <SaveConfigurationSection viewModel={viewModels.saveConfiguration}/>
            <GlobalProgressionSection viewModel={viewModels.globalProgression}/>
          </div>
          <EnergyLevelsSection viewModel={viewModels.energyLevels}/>
          <TerraformationLevelsSection viewModel={viewModels.terraformationLevels}/>
          <PlayersSection viewModel={viewModels.players}/>
        </Show>
      </main>
    </Show>
  );
}
