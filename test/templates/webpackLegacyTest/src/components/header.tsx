import { h, Component, ComponentChild } from "preact";
import * as ResponsiveUtils from "ojs/ojresponsiveutils";
import "ojs/ojtoolbar";
import "ojs/ojmenu";
import "ojs/ojbutton";

type Props = {
  appName: string,
  userLogin: string
}

type State = {
  displayType: "all" | "icons",
  endIconClass: string
}

export class Header extends Component<Props, State> {
  private mediaQuery: MediaQueryList;

  constructor(props: Props) {
    super(props);
    const smallOnlyQuery = ResponsiveUtils.getFrameworkQuery("sm-only");
    this.mediaQuery = window.matchMedia(smallOnlyQuery);
    this._mediaQueryChangeListener = this._mediaQueryChangeListener.bind(this);
    const displayType = this._getDisplayTypeFromMediaQuery(this.mediaQuery);
    const endIconClass = this._getEndIconClassFromDisplayType(displayType);
    this.state = {
      displayType,
      endIconClass
    };
  }

  render(props: Readonly<Props>, state: Readonly<State>): ComponentChild {
    return (
      <header role="banner" class="oj-web-applayout-header">
        <div class="oj-web-applayout-max-width oj-flex-bar oj-sm-align-items-center">
          <div class="oj-flex-bar-middle oj-sm-align-items-baseline">
            <span
              role="img"
              class="oj-icon demo-oracle-icon"
              title="Oracle Logo"
              alt="Oracle Logo"></span>
            <h1
              class="oj-sm-only-hide oj-web-applayout-header-title"
              title="Application Name">
              {props.appName}
            </h1>
          </div>
          <div class="oj-flex-bar-end">
          <oj-toolbar>
            <oj-menu-button id="userMenu" display={state.displayType} chroming="borderless">
              <span>{props.userLogin}</span>
              <span slot="endIcon" class={state.endIconClass}></span>
              <oj-menu id="menu1" slot="menu">
                <oj-option id="pref" value="pref">Preferences</oj-option>
                <oj-option id="help" value="help">Help</oj-option>
                <oj-option id="about" value="about">About</oj-option>
                <oj-option id="out" value="out">Sign Out</oj-option>
              </oj-menu>
            </oj-menu-button>
          </oj-toolbar>
          </div>
        </div>
      </header>
    );
  }

  componentDidMount() {
    this.mediaQuery.addEventListener("change", this._mediaQueryChangeListener);
  }

  componentWillUnmount() {
    this.mediaQuery.removeEventListener("change", this._mediaQueryChangeListener);
  }

  _mediaQueryChangeListener(mediaQuery) {
    const displayType = this._getDisplayTypeFromMediaQuery(mediaQuery);
    const endIconClass = this._getEndIconClassFromDisplayType(displayType);
    this.setState({
      displayType,
      endIconClass
    });
  }

  _getDisplayTypeFromMediaQuery(mediaQuery) {
    return mediaQuery.matches ? "icons" : "all";
  }

  _getEndIconClassFromDisplayType(displayType) {
    return displayType === "icons" ?
      "oj-icon demo-appheader-avatar" :
      "oj-component-icon oj-button-menu-dropdown-icon"
  }
}