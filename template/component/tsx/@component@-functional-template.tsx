import { registerCustomElement } from "ojs/ojvcomponent";
import { h } from "preact";
import componentStrings = require("ojL10n!./resources/nls/@component-name@-strings");
import "css!./@component-name@-styles.css";

type Props = Readonly<{
    message?: string;
}>;

export const @camelcasecomponent-name@   = registerCustomElement("@full-component-name@",  /**
   *
   * @ojmetadata version "1.0.0"
   * @ojmetadata displayName "A user friendly, translatable name of the component"
   * @ojmetadata description "A translatable high-level description for the component"
   */
    ({ message = "Hello from  @full-component-name@" }: Props) => {
        return <p>{message}</p>
    }
);