/**
 * @license
 * Copyright (c) 2014, 2018, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your application specific code will go here
 */

/**
 * Method for sending notifications to the aria-live region for Accessibility.
 * Sending a notice when the page is loaded, as well as changing the page title
 * is considered best practice for making Single Page Applications Accessbible.
 */

let validAriaLiveValues: string[] = ["off", "polite", "assertive"];

export function announce(message: string, manner?: string): void {
  if (manner === undefined || validAriaLiveValues.indexOf(manner) === -1) {
    manner = "polite";
  }

  let params: {
    bubbles: boolean;
    detail: { message: string, manner: string };
  } = {
    "bubbles": true,
    "detail": { "message": message, "manner": manner }
  };

  let globalBodyElement: HTMLElement = document.getElementById("globalBody") as HTMLElement;
  globalBodyElement.dispatchEvent(new CustomEvent("announce", params));
}