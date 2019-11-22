/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(['ojs/ojcomposite', 'text!./@component@-view.html', './@component@-viewModel', 'text!./component.json', 'css!./@component@-styles'],
  function(Composite, view, viewModel, metadata) {
    Composite.register('@component@', {
      view: view,
      viewModel: viewModel,
      metadata: JSON.parse(metadata)
    });
  }
);