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

let beach = require("./demos/BeachDemo")
let wave = require("./demos/WaveDemo")
let magnify = require("./demos/MagnifyDemo")

let beachDemo = new beach.BeachDemo();
let waveDemo = new wave.WaveDemo();
let magnifyDemo = new magnify.MagnifyDemo();

document.querySelectorAll('.nav-icon').forEach(item => {
    item.addEventListener('click', onNavIconClick);
});

let currentlySelectedDemoName = "logo";
let waterAssets = document.getElementById("water-assets");
let idsByDemoName = {
    "logo": ["demo-home"],
    "magnify": ["demo-magnify", "water-assets"],
    "wave": ["demo-wave"],
    "beach": ["demo-beach", "beach-canvas", "beach-bg"]
}

function onNavIconClick(evt) {
    const element = evt.srcElement;
    const demoName = element.id.split('-').pop();

    toggleDemo(demoName);
}

function toggleDemo(demoName) {
    if (demoName === currentlySelectedDemoName) return;

    //activate items
    idsByDemoName[demoName].forEach((eleId) => {
        document.getElementById(eleId).classList.remove("hidden");
    });

    const navIconId = demoName === 'logo'
        ? 'logo'
        : `button-${ demoName }`;
    document.getElementById(navIconId).classList.add("selected");

    //deactivate items
    idsByDemoName[currentlySelectedDemoName].forEach((eleId) => {
        document.getElementById(eleId).classList.add("hidden");
    })

    const prevNavIconId = currentlySelectedDemoName === 'logo'
        ? 'logo'
        : `button-${ currentlySelectedDemoName }`;
    document.getElementById(prevNavIconId).classList.remove("selected");

    currentlySelectedDemoName = demoName;

    if (demoName === "magnify") {
        magnifyDemo.start();
    }
    if (demoName === "wave") {
        waveDemo.start();
    } else {
        waveDemo.stop();
    }
    if (demoName === "beach") {
        beachDemo.start();
    } else {
        beachDemo.stop();
    }

    if (demoName !== 'logo') {
        document.location.hash = '#' + demoName;
    }
}

var resizeId;

function whileResizing() {
    clearTimeout(resizeId);
    resizeId = setTimeout(fireResizeEvents, 500);
}

function fireResizeEvents() {
    beachDemo.onResize();
    waveDemo.onResize();
    magnifyDemo.onResize();
}

window.onresize = whileResizing;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.querySelector(".rail").style.display = "none";
    document.getElementById("if-mobile").style.display = "block";
}

{
    let demoNameFromHash = document.location.hash.substr(1);
    if (idsByDemoName[demoNameFromHash]) {
        toggleDemo(demoNameFromHash);
    }
}
