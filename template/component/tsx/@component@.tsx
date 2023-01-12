import { customElement, ExtendGlobalProps } from "ojs/ojvcomponent";
import { h, Component, ComponentChild } from "preact";
import componentStrings = require("ojL10n!./resources/nls/@component-name@-strings");
import "css!./@component-name@-styles.css";

type Props = Readonly<{
  message?: string;
}>;

/**
 * @ojmetadata pack "@pack-name@"
 * @ojmetadata version "1.0.0"
 * @ojmetadata displayName "A user friendly, translatable name of the component"
 * @ojmetadata description "A translatable high-level description for the component"
 * @ojmetadata main "@pack-name@/@component-name@"
*/
@customElement("@full-component-name@")
export class @camelcasecomponent-name@ extends Component < ExtendGlobalProps < Props >> {
  static defaultProps: Partial < Props > = {
  message: "Hello from @full-component-name@!"
};

render(props: Props): ComponentChild {
  return <p>{props.message}</p>;
}
}
