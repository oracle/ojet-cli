import Composite = require("ojs/ojcomposite");
import * as view from "text!./@component-name@-view.html";
import viewModel from "./@component-name@-viewModel";
import * as metadata from "text!./component.json";
import "css!./@component-name@-styles.css";

Composite.register("@full-component-name@", {
  view: view,
  viewModel: viewModel,
  metadata: JSON.parse(metadata)
});

declare global {
  namespace preact.JSX {
    interface IntrinsicElements {
      "@full-component-name@": any;
    }
  }
}