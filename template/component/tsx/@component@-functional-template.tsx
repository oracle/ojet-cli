import { ExtendGlobalProps, registerCustomElement } from "ojs/ojvcomponent";
import { h, ComponentProps, ComponentType } from "preact";
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
function @camelcasecomponent-name@Impl(
  { message = "Hello from  @full-component-name@" }: Props
) {
  return <p>{message}</p>
}

export const @camelcasecomponent-name@: ComponentType <
  ExtendGlobalProps < ComponentProps < typeof @camelcasecomponent-name@Impl>>
> = registerCustomElement(
    "@full-component-name@",
  @camelcasecomponent-name@Impl
);