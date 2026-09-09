import {Router, RouteSectionProps} from "@solidjs/router";
import {FileRoutes} from "@solidjs/start/router";
import "./app.css";
import {Component, Suspense} from "solid-js";
import {appName} from "~/messages/appMessages";

const Layout: Component<RouteSectionProps> = (props) => {
  return (
    <>
      <header>
        <h1 class="text-center drop-shadow-engraved">{appName}</h1>
      </header>
      <div class="container rounded-lg">
        {props.children}
      </div>
      <footer class="text-center">
        &nbsp;
        {/* TODO */}
      </footer>
    </>
  );
};

export default function App() {
  return (
    <Suspense>
      <Router root={Layout}>
        <FileRoutes/>
      </Router>
    </Suspense>
  );
}
