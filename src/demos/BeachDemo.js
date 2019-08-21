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

let noisejs = require("noisejs");
let canvasHelper = require("../helpers/Painter");
var noise = new noisejs.Noise(Math.random());

const phraseBank = [
    "The spectacle before us was indeed sublime",
    "Waves flung themselves at the blue evening",
    "Silver mist suffused the deck of the ship",
    "I watched the storm, so beautiful yet terrific"
];

class BeachDemo {
    constructor() {
        this.canvas = document.getElementById("beach-canvas");
        this.canvasContext = this.canvas.getContext("2d");
        this.animatingText = document.getElementById("text-one-fading");
        this.phrase = 0;
        this.beachStep = 0;
        this.beachStepAmount = 1;
        this.waveStopped = false;
        this.frameNumber = 0;
        this.painter = new canvasHelper.Painter(this.canvas, this.canvasContext);
        this.animationRequest = null;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        this.setCanvasBounds();
    }

    start() {
        this.animationRequest = window.requestAnimationFrame(() => this.draw());
    }

    stop() {
        window.cancelAnimationFrame(this.animationRequest);
    }

    setCanvasBounds() {
        this.canvas.width = this.windowWidth;
        this.canvas.height = this.windowHeight;
        this.canvas.style.width = this.canvas.width + "px";
        this.canvas.style.height = this.canvas.height + "px";
    }

    increment() {
        this.beachStep += this.beachStepAmount;
    }

    fragment() {
        this.animatingText.classList.remove("rebuild");
        this.animatingText.classList.add("fragment");
    }

    rebuild() {
        this.animatingText.classList.remove("fade-in");
        this.animatingText.classList.remove("fragment");
        this.animatingText.classList.add("rebuild");
    }

    fadeOut() {
        this.animatingText.classList.remove("fade-in");
        this.animatingText.classList.add("fade-out");
    }

    fadeIn() {
        this.animatingText.classList.remove("fade-out");
        this.animatingText.classList.add("fade-in");
    }

    stopWave() {
        this.waveStopped = true;
        this.beachStepAmount = 0;
    }

    startWave() {
        this.waveStopped = false;
        this.beachStepAmount = 1;
    }

    easeOutIn(x) {
        return (Math.pow(-2 * Math.abs(x - 0.5), 3) + 1);
    }

    drawWave(drawFill, drawStroke, fillColor,
        fillOpacity, strokeColor, strokeOpacity, lineWidth,
        xOffset, noiseScale, iScaleSmall, iScaleLarge,
        noiseXOffset, noiseModifier, waveLength) {

        this.painter.begin();
        this.painter.vertex(0, 0)
        for (var i = 0; i < this.windowHeight; i++) {
            let xNoise = -1 * noiseScale * noise.simplex2(i / iScaleSmall + noiseXOffset, noiseModifier);
            let xBaseShape = -1 * waveLength * noise.simplex2(i / iScaleLarge + noiseXOffset, noiseModifier / 3);
            let xVal = xBaseShape + xOffset + xNoise;
            this.painter.vertex(xVal, i);
        }
        this.painter.vertex(0, this.windowHeight);

        if (drawStroke) {
            this.painter.lineWidth(lineWidth);
            this.painter.strokeStyle(strokeColor);
            this.painter.setOpacity(strokeOpacity);
            this.painter.drawStroke();
        }

        if (drawFill) {
            this.painter.fillStyle(fillColor);
            this.painter.setOpacity(fillOpacity);
            this.painter.drawFill();
        }

    }

    draw() {

        this.painter.clearCanvas();
        this.increment();
        let distanceTraveled = Math.floor(this.windowWidth / 2);
        distanceTraveled = distanceTraveled % 2 === 0 ? distanceTraveled : distanceTraveled - 1;
        let cyclePosition = ((this.beachStep) % distanceTraveled) / distanceTraveled;
        let easedValue = this.easeOutIn(cyclePosition);
        let xStep = distanceTraveled * easedValue + this.windowWidth / 3;
        if (cyclePosition > 0.15) {
            this.fragment();
        } else if (this.frameNumber !== 0 &&
            !this.waveStopped &&
            cyclePosition === 0) {

            this.stopWave();
            setTimeout(() => {
                this.fadeOut();
                setTimeout(() => {
                    this.animatingText.innerHTML = phraseBank[(this.phrase++) % 3];
                    this.fadeIn();
                    setTimeout(() => {
                        this.rebuild();
                        setTimeout(() => {
                            this.startWave();
                        }, 8000)
                    }, 1000)
                }, 1000)
            }, 1500)
        }

        let noiseModifier = this.frameNumber / 150;
        let noiseScale = 10;
        let iScale = 60;
        let waveLength = 65;


        for (var j = 0; j < 3; j++) {
            this.drawWave(true, true, "#c8e6ff", 0.3, "#FFFFFF", 0.95,
                3, xStep, noiseScale, iScale, 250, j, noiseModifier, waveLength);
        }

        for (var j = 0; j < 5; j++) {
            this.drawWave(false, true, null, null, "#FFFFFF", 0.95,
                j, xStep, noiseScale, iScale, 250, j / 5, noiseModifier, waveLength);
        }

        this.drawWave(true, false, "#93cde7", 0.25, null, null, null,
            xStep - 100, noiseScale, iScale, 250, 1.5, noiseModifier, waveLength / 2);

        this.drawWave(true, false, "#64c8dc", 0.2, null, null, null,
            xStep - 200, noiseScale, iScale, 250, 2, noiseModifier, waveLength / 2);

        this.drawWave(true, false, "#e6c8c8", 0.3, null, null, null,
            this.windowWidth * 0.9, noiseScale, iScale, 250, 2.5, 0, waveLength / 2);

        this.drawWave(true, false, "#356BBF", 0.05, null, null, null,
            this.windowWidth * 0.1, noiseScale, iScale, 250, 2.5, noiseModifier, waveLength / 2);

        this.frameNumber++;
        this.animationRequest = window.requestAnimationFrame(() => this.draw());
    }

    onResize() {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.setCanvasBounds();
    }
}

module.exports.BeachDemo = BeachDemo;