import { customElement, ExtendGlobalProps } from "ojs/ojvcomponent";
import { h, Component, ComponentChild } from "preact";
import Context = require("ojs/ojcontext");
import { Footer } from "./footer";
import { Header } from "./header";
import { Content } from "./content/index";

type Props = {
  appName?: string;
  userLogin?: string;
}

@customElement("app-root")
export class App extends Component<ExtendGlobalProps<Props>> {
  static defaultProps: Props = {
    appName: 'App Name',
    userLogin: "john.hancock@oracle.com"
  };

  render(props: ExtendGlobalProps<Props>): ComponentChild {
    return (
      <div id="appContainer" class="oj-web-applayout-page">
        <Header
          appName={props.appName} 
          userLogin={props.userLogin} 
        />
        <Content />
        <Footer />
      </div>
    );
  }

  componentDidMount() {
    Context.getPageContext().getBusyContext().applicationBootstrapComplete();
  }
}
