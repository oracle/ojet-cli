import Composite = require("ojs/ojcomposite");
import * as view from "text!./my-component-view.html";
import viewModel from "./my-component-viewModel";
import * as metadata from "text!./component.json";
import "css!./my-component-styles";

Composite.register("my-component", {
  view: view,
  viewModel: viewModel,
  metadata: JSON.parse(metadata)
});