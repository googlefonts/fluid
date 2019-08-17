/** @license
 *  Copyright 2019 Google LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not
 *  use this file except in compliance with the License. You may obtain a copy
 *  of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 *  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 *  License for the specific language governing permissions and limitations
 *  under the License.
 */

let currentlySelectedButtonId = "logo";
let waterAssets = document.getElementById("water-assets");

let buttonMappings = {
  "logo": ["demo-home"],
  "button-magnify": ["demo-magnify", "water-assets"],
  "button-wave": ["demo-wave"],
  "button-beach": ["demo-beach", "defaultCanvas0", "white-bg"]
}

function toggleDemo(evt){
  const element = evt.srcElement;

  if(element.id === currentlySelectedButtonId) return;

  //activate items
  buttonMappings[element.id].forEach((eleId) => {
    document.getElementById(eleId).classList.remove("hidden");
  })
  document.getElementById(element.id).classList.add("selected");

  //deactivate items
  buttonMappings[currentlySelectedButtonId].forEach((eleId) => {
    document.getElementById(eleId).classList.add("hidden");
  })
  document.getElementById(currentlySelectedButtonId).classList.remove("selected");

  currentlySelectedButtonId = element.id;
    if(element.id === "button-magnify") recomputeBoundsForMagnify();
    if(element.id === "button-wave") recomputeBoundsWave();
    if(element.id === "button-beach") loop();
    else {noLoop();}
}

document.querySelectorAll('.nav-icon').forEach(item => {
  item.addEventListener('click', toggleDemo);
});
