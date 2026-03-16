import {createSignal, onMount, Show} from 'solid-js';
import PlayersSection from '../components/PlayersSection';
import GlobalProgressionSection from "../components/GlobalProgressionSection";
import TerraformationLevelsSection from '../components/TerraformationLevelsSection';
import {parseSaveSections} from "../../../util-parsing/parseSaveSections";

export default function Home() {
  const [file, setFile] = createSignal<File | null>(null);
  const [sections, setSections] = createSignal<ParsedSections | null>(null);
  const [errors, setErrors] = createSignal<string[]>([]);
  const [isReady, setIsReady] = createSignal<boolean>(false);

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
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const {sections, errors} = parseSaveSections(event.target?.result as string);
        setSections(sections);
        setErrors(errors);
      };
      reader.readAsText(fileInput);
    }
  };

  return (
    <Show when={isReady()} fallback={<p class="text-color-muted">Loading...</p>}>
      <main>
        <h2>File selection</h2>
        <input type="file" accept="application/json" onChange={handleFileChange}/>
        <button onClick={handleSubmit} disabled={!file()}>Submit</button>

        <h2>Visualization</h2>
        <Show when={!errors().length && !sections()}>
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

        <Show when={sections() && !errors().length}>
          <GlobalProgressionSection sections={() => sections()!}/>
          <TerraformationLevelsSection sections={() => sections()!}/>
          <PlayersSection sections={() => sections()!}/>
        </Show>
      </main>
    </Show>
  );
}
