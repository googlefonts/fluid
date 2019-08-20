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

function toggleDemo(evt) {
    const element = evt.srcElement;

    if (element.id === currentlySelectedButtonId) return;

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

    if (element.id === "button-magnify") {
        magnifyDemo.start();
    }
    if (element.id === "button-wave") {
        waveDemo.start();
    } else {
        waveDemo.stop();
    }
    if (element.id === "button-beach") {
        beachDemo.start();
    } else {
        beachDemo.stop();
    }
}

document.querySelectorAll('.nav-icon').forEach(item => {
    item.addEventListener('click', toggleDemo);
});

let beachDemo = new BeachDemo();
let waveDemo = new WaveDemo();
let magnifyDemo = new MagnifyDemo();

var resizeId;

function whileResizing() {
    clearTimeout(resizeId);
    resizeId = setTimeout(fireResizeEvents, 500);
}

function fireResizeEvents() {
    console.log("fire resize")
    beachDemo.onResize();
    waveDemo.onResize();
    magnifyDemo.onResize();
}

window.onresize = whileResizing;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.querySelector(".rail").style.display = "none";
    document.getElementById("if-mobile").style.display = "block";
}