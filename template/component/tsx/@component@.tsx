import { VComponent, customElement, h } from "ojs/ojvcomponent";
import componentStrings = require("ojL10n!./resources/nls/@component-name@-strings");

// Define component properties
class Props {
  messageText?: string = "Hello from @full-component-name@!";
}

// Define type for component state
type State = {
  // State members should be declared here
};

// Declare the VComponent as a custom  element

/**
 * @ojmetadata pack "@pack-name@"
 * @ojmetadata version "1.0.0"
 * @ojmetadata displayName "A user friendly, translatable name of the component"
 * @ojmetadata description "A translatable high-level description for the component"
*/
@customElement("@full-component-name@")
export class @camelcase-component-name@ extends VComponent<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props);

    // Components should initialize their state objects in their constructors.
    // After that, components should use updateState() or updateStateFromProps() to update the state.
  }

  // implement render() method to return a virtual DOM representation of the component’s content
  protected render(): VComponent.VNode {
    return <p>{this.props.messageText}</p>;
  }

  // Optional lifecycle methods - implement if necessary

  // Called after the virtual component has been initially rendered and inserted into the DOM
  protected mounted(): void {}

  // Called after the render method in updating (state or property change) cases.
  protected updated(oldProps: Readonly<Props>, oldState: Readonly<State>) : void {}

  // Called after the virtual component has been removed from the DOM.
  protected unmounted(): void {}
}
