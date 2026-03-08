import { createSignal } from 'solid-js';
import { Show, For } from 'solid-js';
import { LoadSaveDataController } from '../../../util-mapping/controllers/LoadSaveDataController';

export default function Home() {
  const [file, setFile] = createSignal<File | null>(null);
  const [viewModel, setViewModel] = createSignal<any | null>(null);

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
        const saveString = event.target?.result as string;
        const vm = LoadSaveDataController.loadSaveData(saveString);
        setViewModel(vm);
      };
      reader.readAsText(fileInput);
    }
  };

  return (
    <main>
      <h2>File selection</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSubmit} disabled={!file()}>Submit</button>

      <h2>Visualization</h2>
      <Show when={!viewModel()}>
        <p class="text-color-muted">Parsed data will appear here.</p>
      </Show>

      <Show when={viewModel()}>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <For each={viewModel().players || []}>{(player) => (
              <tr>
                <td>Name</td>
                <td>{player.name}</td>
              </tr>
            )}</For>
          </tbody>
        </table>
      </Show>
    </main>
  );
}
