export default function Home() {
  return (
    <main>
      <h2>File selection</h2>
      <input type="file" />
      <button>Submit</button>

      <h2>Visualization</h2>
      <p class="text-color-muted">Parsed data will appear here.</p>

      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Example Key</td>
            <td>Example Value</td>
          </tr>
          <tr>
            <td>Example Key</td>
            <td>Example Value</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
