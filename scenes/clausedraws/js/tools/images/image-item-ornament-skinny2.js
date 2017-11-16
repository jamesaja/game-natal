/*
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.provide('app.ImageItemOrnamentSkinny2');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Skinny ornament 2 image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemOrnamentSkinny2 = function() {
  app.SVGImage.call(this);

  this.width = 23.4;
  this.height = 63.1;
};
app.ImageItemOrnamentSkinny2.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemOrnamentSkinny2.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 25.22 63.08"><defs><style>.cls-1,.cls-7{fill:none;}.cls-2{fill:' + color + ';}.cls-3{clip-path:url(#clip-path);}.cls-4{fill:#fff;}.cls-5{fill:#231f20;opacity:0.06;}.cls-6{fill:#607d8b;}.cls-7{stroke:#607d8b;stroke-miterlimit:10;stroke-width:1.03px;}</style><clipPath id="clip-path"><path class="cls-1" d="M18.57,16.21a6.1,6.1,0,0,0-2.31-1.76V8.66H8.81v5.79a6,6,0,0,0-2.3,1.76c-14,19.19,1.81,41.9,5.35,46.54a.86.86,0,0,0,1.35,0C16.75,58.11,32.56,35.4,18.57,16.21Z"/></clipPath></defs><title>primary_skinny2</title><g id="Layer_2" data-name="Layer 2"><g id="ART"><path class="cls-2" d="M18.57,16.21a6.1,6.1,0,0,0-2.31-1.76V8.66H8.81v5.79a6,6,0,0,0-2.3,1.76c-14,19.19,1.81,41.9,5.35,46.54a.86.86,0,0,0,1.35,0C16.75,58.11,32.56,35.4,18.57,16.21Z"/><g class="cls-3"><polygon class="cls-4" points="8.4 35.87 4.05 33.23 0 35.87 4.05 38.52 8.4 35.87"/><polygon class="cls-4" points="16.81 35.87 12.46 33.23 8.4 35.87 12.46 38.52 16.81 35.87"/><polygon class="cls-4" points="25.21 35.87 20.86 33.23 16.81 35.87 20.86 38.52 25.21 35.87"/></g><path class="cls-5" d="M18.57,16.21a6.1,6.1,0,0,0-2.31-1.76V8.66H12.88v5.79c10.63,21.67,2.67,34.7-2,46.91.4.57.74,1,1,1.39a.86.86,0,0,0,1.35,0C16.75,58.11,32.56,35.4,18.57,16.21Z"/><path class="cls-6" d="M8.32,7.31a.1.1,0,0,0-.1.1v5.5a.1.1,0,0,0,.17.08l1.22-1.22a.1.1,0,0,1,.14,0l1.32,1.32a.11.11,0,0,0,.15,0l1.32-1.32a.1.1,0,0,1,.14,0L14,13.09a.1.1,0,0,0,.14,0l1.32-1.32a.1.1,0,0,1,.14,0L16.82,13a.1.1,0,0,0,.17-.08V7.41a.09.09,0,0,0-.1-.1Z"/><circle class="cls-7" cx="12.61" cy="3.98" r="3.47"/></g></g></svg>';
  return data;
};
