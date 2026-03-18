import {Router, RouteSectionProps} from "@solidjs/router";
import {FileRoutes} from "@solidjs/start/router";
import "./app.css";
import {Component} from "solid-js";

const Layout: Component<RouteSectionProps> = (props) => {
  return (
    <>
      <header>
        <h1 class="text-center drop-shadow-engraved">Planet Crafter Save Manager</h1>
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
    <Router root={Layout}>
      <FileRoutes/>
    </Router>
  );
}
