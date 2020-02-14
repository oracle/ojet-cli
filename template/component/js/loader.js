/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(['ojs/ojcomposite', 'text!./@component-name@-view.html', './@component-name@-viewModel', 'text!./component.json', 'css!./@component-name@-styles'],
  function(Composite, view, viewModel, metadata) {
    Composite.register('@full-component-name@', {
      view: view,
      viewModel: viewModel,
      metadata: JSON.parse(metadata)
    });
  }
);