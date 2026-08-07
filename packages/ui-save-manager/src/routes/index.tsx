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

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      setFile(input.files[0]);
    }
  };

  const handleSubmit = () => {
    const fileInput = file();
    if (fileInput) {

      if (!fileInput.name.endsWith('.json')) {
        setErrors(['INVALID: not a .json file']);
        setWarnings([]);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const {sections, errors, warnings} = parseSaveSections(event.target?.result as string);
        setSections(sections);
        setErrors(errors);
        setWarnings(warnings);
      };
      reader.readAsText(fileInput);
    }
  };

  return (
    <Show when={isReady()} fallback={<p class="text-color-muted">Loading...</p>}>
      <main>
        <h2>Display</h2>
        <input type="file" accept="application/json" onChange={handleFileChange}/>
        <button onClick={handleSubmit} disabled={!file()}>Submit</button>

        <MergeSection onMergeResult={setMergeResult}/>

        <h2>Visualization</h2>
        <MergeResultSection result={mergeResult}/>

        <Show when={!errors().length && !sections() && !mergeResult()}>
          <p class="text-color-muted">Parsed data will appear here.</p>
        </Show>

        <Show when={errors().length}>
          <h3>Errors</h3>
          <ul>
            {errors().map((error) => (
              <li>{error}</li>
            ))}
          </ul>
        </Show>

        <Show when={warnings().length}>
          <h3>Warnings</h3>
          <ul>
            {warnings().map((warning) => (
              <li>{warning}</li>
            ))}
          </ul>
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
