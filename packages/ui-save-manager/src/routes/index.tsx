import {createSignal, Show} from 'solid-js';
import PlayersSection from '../components/PlayersSection';
import {parseSaveSections} from "../../../util-parsing/parseSaveSections";
import {ParsedSave} from "../../../util-types/gameDefinitions";

export default function Home() {
  const [file, setFile] = createSignal<File | null>(null);
  const [sections, setSections] = createSignal<ParsedSave|null>(null);

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
        const sections = parseSaveSections(event.target?.result as string);
        setSections(sections);
      };
      reader.readAsText(fileInput);
    }
  };

  return (
    <main>
      <h2>File selection</h2>
      <input type="file" onChange={handleFileChange}/>
      <button onClick={handleSubmit} disabled={!file()}>Submit</button>

      <h2>Visualization</h2>
      <Show when={!sections()}>
        <p class="text-color-muted">Parsed data will appear here.</p>
      </Show>

      <Show when={sections()}>
        <PlayersSection sections={sections()!}/>
      </Show>
    </main>
  );
}
