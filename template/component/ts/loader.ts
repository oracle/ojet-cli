import Composite = require("ojs/ojcomposite");
import * as view from "text!./@component@-view.html";
import viewModel from "./@component@-viewModel";
import * as metadata from "text!./component.json";
import "css!./@component@-styles";

Composite.register("@component@", {
  view: view,
  viewModel: viewModel,
  metadata: JSON.parse(metadata)
});