import {createSignal, onMount, Show} from 'solid-js';
import PlayersSection from '../components/PlayersSection';
import GlobalProgressionSection from "../components/GlobalProgressionSection";
import TerraformationLevelsSection from '../components/TerraformationLevelsSection';
import {parseSaveSections} from "../../../util-parsing/parseSaveSections";

export default function Home() {
  const [file, setFile] = createSignal<File | null>(null);
  const [sections, setSections] = createSignal<ParsedSections | null>(null);
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
      const reader = new FileReader();
      reader.onload = (event) => {
        const {sections} = parseSaveSections(event.target?.result as string);
        setSections(sections);
      };
      reader.readAsText(fileInput);
    }
  };

  return (
    <Show when={isReady()} fallback={<p class="text-color-muted">Loading...</p>}>
      <main>
        <h2>File selection</h2>
        <input type="file" onChange={handleFileChange}/>
        <button onClick={handleSubmit} disabled={!file()}>Submit</button>

        <h2>Visualization</h2>
        <Show when={!sections()}>
          <p class="text-color-muted">Parsed data will appear here.</p>
        </Show>

        <Show when={sections()}>
          <TerraformationLevelsSection sections={() => sections()!}/>
          <GlobalProgressionSection sections={() => sections()!}/>
          <PlayersSection sections={() => sections()!}/>
        </Show>
      </main>
    </Show>
  );
}
