/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

// icons and graphics for the generator

module.exports = {
  PATH: 'res',
  ICONS: {
    ios:
    [{ file: 'icon-small.png', width: '29', height: '29' },
      { file: 'icon-small@2x.png', width: '58', height: '58' },
      { file: 'icon-small@3x.png', width: '87', height: '87' },
      { file: 'icon-40.png', width: '40', height: '40' },
      { file: 'icon-40@2x.png', width: '80', height: '80' },
      { file: 'icon-40@3x.png', width: '120', height: '120' },
      { file: 'icon-50.png', width: '50', height: '50' },
      { file: 'icon-50@2x.png', width: '100', height: '100' },
      { file: 'icon.png', width: '57', height: '57' },
      { file: 'icon@2x.png', width: '114', height: '114' },
      { file: 'icon-72.png', width: '72', height: '72' },
      { file: 'icon-72@2x.png', width: '144', height: '144' },
      { file: 'icon-76.png', width: '76', height: '76' },
      { file: 'icon-76@2x.png', width: '152', height: '152' },
      { file: 'icon-83.5@2x.png', width: '167', height: '167' },
      { file: 'icon-60.png', width: '60', height: '60' },
      { file: 'icon-60@2x.png', width: '120', height: '120' },
      { file: 'icon-60@3x.png', width: '180', height: '180' }],
    android:
    [{ file: 'icon-ldpi.png', width: '36', height: '36' },
       { file: 'icon-mdpi.png', width: '48', height: '48' },
       { file: 'icon-hdpi.png', width: '72', height: '72' },
       { file: 'icon-xhdpi.png', width: '96', height: '96' },
       { file: 'icon-xxhdpi.png', width: '144', height: '144' },
       { file: 'icon-xxxhdpi.png', width: '192', height: '192' }],
    windows:
    [{ file: 'Square30x30Logo.scale-100.png', width: '30', height: '30' },
       { file: 'Square44x44Logo.scale-100.png', width: '44', height: '44' },
       { file: 'Square44x44Logo.scale-240.png', width: '106', height: '106' },
       { file: 'Square70x70Logo.scale-100.png', width: '70', height: '70' },
       { file: 'Square71x71Logo.scale-100.png', width: '71', height: '71' },
       { file: 'Square71x71Logo.scale-240.png', width: '170', height: '170' },
       { file: 'Square150x150Logo.scale-100.png', width: '150', height: '150' },
       { file: 'Square150x150Logo.scale-240.png', width: '360', height: '360' },
       { file: 'Square310x310Logo.scale-100.png', width: '310', height: '310' },
       { file: 'Wide310x150Logo.scale-100.png', width: '310', height: '150' },
       { file: 'Wide310x150Logo.scale-240.png', width: '744', height: '360' }
    ] },
  SPLASH: {
    ios:
    [{ src: 'Default@2x~iphone.png', width: '640', height: '960' },
       { src: 'Default-568h@2x~iphone.png', width: '640', height: '1136' },
       { src: 'Default-667h.png', width: '750', height: '1334' },
       { src: 'Default-736h.png', width: '1242', height: '2208' },
       { src: 'Default~iphone.png', width: '320', height: '480' },
       { src: 'Default-Landscape~ipad.png', width: '1024', height: '768' },
       { src: 'Default-Landscape@2x~ipad.png', width: '2048', height: '1536' },
       { src: 'Default-Landscape-736h.png', width: '2208', height: '1242' },
       { src: 'Default-Portrait@2x~ipad.png', width: '1536', height: '2048' },
       { src: 'Default-Portrait~ipad.png', width: '768', height: '1024' },
       { src: 'Default-Portrait-iphone-x-2436h.png', width: '1125', height: '2436' },
       { src: 'Default-Portrait-iphone-x-1125h.png', width: '2436', height: '1125' }
    ],
    android:
    [{ src: 'splash-land-ldpi.9.png', density: 'land-ldpi' },
       { src: 'splash-land-mdpi.9.png', density: 'land-mdpi' },
       { src: 'splash-land-hdpi.9.png', density: 'land-hdpi' },
       { src: 'splash-land-xhdpi.9.png', density: 'land-xhdpi' },
       { src: 'splash-land-xxhdpi.9.png', density: 'land-xxhdpi' },
       { src: 'splash-land-xxxhdpi.9.png', density: 'land-xxxhdpi' },
       { src: 'splash-port-hdpi.9.png', density: 'port-hdpi' },
       { src: 'splash-port-ldpi.9.png', density: 'port-ldpi' },
       { src: 'splash-port-mdpi.9.png', density: 'port-mdpi' },
       { src: 'splash-port-xhdpi.9.png', density: 'port-xhdpi' },
       { src: 'splash-port-xxhdpi.9.png', density: 'port-xxhdpi' },
       { src: 'splash-port-xxxhdpi.9.png', density: 'port-xxxhdpi' }
    ],
    windows:
    [{ src: 'SplashScreen.scale-100.png', width: '620', height: '300' },
       { src: 'SplashScreenPhone.scale-240.png', width: '1152', height: '1920' }
    ] }
};

