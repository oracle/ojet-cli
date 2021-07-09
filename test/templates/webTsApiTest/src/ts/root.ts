import * as ko from "knockout";
import rootViewModel from "./appController";
import "ojs/ojknockout";
import "ojs/ojmodule";
import "ojs/ojnavigationlist";
import "ojs/ojbutton";
import "ojs/ojtoolbar";

export = class Root {
  static init(): void {
    function _init(): void {
      // bind your ViewModel for the content of the whole page body.
      ko.applyBindings(rootViewModel, document.getElementById("globalBody"));
    }
    // if running in a hybrid (e.g. Cordova) environment, we need to wait for the deviceready
    // event before executing any code that might interact with Cordova APIs or plugins.
    if (document.body.classList.contains("oj-hybrid")) {
      document.addEventListener("deviceready", _init);
    } else {
      _init();
    }
  }
}