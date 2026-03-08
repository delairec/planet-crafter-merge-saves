import {A} from "@solidjs/router";

export default function NotFound() {
  return (
    <main class="py-4 text-center text-xl">
      <p class="text-6xl">
        404&nbsp;
        <span class="uppercase middle text-lg">Not Found</span>
      </p>
      <A href="/">← Back home</A>
    </main>
  );
}
