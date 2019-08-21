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

const fls = require("../helpers/FluidSimulation")
const objP = require("../helpers/ObjectPool")

var gravity = new b2Vec2(0, -10);
world = new b2World(gravity);

class WaveDemo {

    constructor() {

        this.animationRequest = null;
        this.demoWidth = document.getElementById("demo").clientWidth;
        this.demoHeight = document.getElementById("demo").clientHeight;


        //DOM elements
        this.container = document.getElementById("water-container");
        this.containerRect = this.container.getBoundingClientRect();
        this.mouseSquare = document.getElementById("mouse-square");
        this.mouseSquareRect = this.mouseSquare.getBoundingClientRect();

        //setup fluid sim
        let gravity = new b2Vec2(0, -10);
        let timeStep = 1.0 / 60.0;
        let velocityIterations = 8;
        let positionIterations = 3;
        let baselineAmtPerCell = 5;

        this.fluidSim = new fls.FluidSimulation(world, timeStep, velocityIterations, positionIterations);

        this.fontSize = this.demoWidth / (35); //TODO - needs refinement for viewport
        this.waveXPositionOffset = this.demoWidth / 2 - this.fontSize / 2;
        this.waveXPositionScale = this.demoWidth / 2.5 * 1.1;
        this.waveYPositionOffset = this.demoHeight + this.fontSize / 2;
        this.waveYPositionScale = (this.demoWidth / 2.5) * 1.15;

        this.objectPool = new objP.ObjectPool(this.fontSize, 45, 100, 5, 100, 900, 100, this.fluidSim.getNumParticles(), baselineAmtPerCell, this.container);
        this.container.addEventListener("mousemove", (ele) => this.mouseMoveHandler(ele));
    }

    mouseMoveHandler(ele) {
        const x = ele.clientX - this.containerRect.left;
        const y = ele.clientY - this.containerRect.top;
        this.mouseSquare.style.transform = `translate3d(${x - (this.mouseSquareRect.right - this.mouseSquareRect.left)/2}px, ${y}px, 0)`;
        this.fluidSim.moveMouse((x - this.waveXPositionOffset) / this.waveXPositionScale, (this.waveYPositionOffset - y) / this.waveXPositionScale);
    }

    start() {
        this.animationRequest = window.requestAnimationFrame(() => this.step());
        this.recomputeBounds();
    }

    stop() {
        window.cancelAnimationFrame(this.animationRequest);
    }

    recomputeBounds() {
        this.containerRect = this.container.getBoundingClientRect();
        this.mouseSquareRect = this.mouseSquare.getBoundingClientRect();
        this.demoWidth = document.getElementById("demo").clientWidth;
        this.demoHeight = document.getElementById("demo").clientHeight;

        this.waveXPositionOffset = this.demoWidth / 2 - this.fontSize / 2;
        this.waveXPositionScale = this.demoWidth / 2.5 * 1.1;
        this.waveYPositionOffset = this.demoHeight + this.fontSize / 2;
        this.waveYPositionScale = (this.demoWidth / 2.5) * 1.15;
    }

    drawParticleSystem(system) {
        let particles = system.GetPositionBuffer();
        let maxParticles = particles.length;

        this.objectPool.cellsInUse.map(cell => {
            cell[3].style.transform = 'translate3D( 0px, 2000px, 0px)'
            cell[0] = true;
        })

        this.objectPool.cellsInUse = []

        for (let i = 0; i < maxParticles; i += 2) {
            let positionVectorX = particles[i] * this.waveXPositionScale + this.waveXPositionOffset;
            let positionVectorY = -particles[i + 1] * this.waveYPositionScale + this.waveYPositionOffset;

            let partOneH = this.demoHeight * 1 / 2;
            let partTwoH = this.demoHeight - partOneH;

            let partOneW = this.demoWidth;
            let partTwoW = this.demoWidth - partOneH;

            let weight = 800 * (objP.clampNumber(positionVectorY, partTwoH, this.demoHeight) - partTwoH) / (partOneH) + 100;
            let width = 55 * (objP.clampNumber(positionVectorX, 0, this.demoWidth)) / (this.demoWidth) + 45;

            let currentElement = this.objectPool.grabCorrectObject(width, weight);
            currentElement[3].style.transform = 'translate3D(' + Math.floor(positionVectorX) + 'px,' + Math.floor(positionVectorY) + 'px, 1px)';
            currentElement[0] = false;

            this.objectPool.cellsInUse.push(currentElement);
        }
    }

    step() {
        this.fluidSim.step();
        this.drawParticleSystem(world.particleSystems[0]);
        this.animationRequest = window.requestAnimationFrame(() => this.step());
    }

    onResize() {
        this.recomputeBounds();
    }
}

module.exports.WaveDemo = WaveDemo;