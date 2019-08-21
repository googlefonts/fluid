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

var gravity = new b2Vec2(0, -10);
world = new b2World(gravity);

class FluidSimulation {

    constructor(world, timeStep, velocityIterations, positionIterations) {

        world = world;
        this.timeStep = timeStep;
        this.velocityIterations = velocityIterations;
        this.positionIterations = positionIterations;

        var bodyDef = new b2BodyDef();
        var ground = world.CreateBody(bodyDef);

        var mouseDef = new b2BodyDef();
        mouseDef.type = b2_staticBody;
        mouseDef.position.Set(0, 2);
        var mouseBody = world.CreateBody(mouseDef);
        this.mouse = mouseBody;

        var mouseShape = new b2PolygonShape();
        mouseShape.SetAsBoxXY(0.05, 0.05);
        mouseBody.CreateFixtureFromShape(mouseShape, 5);

        bodyDef.type = b2_staticBody;
        bodyDef.position.Set(0, 1);
        var body = world.CreateBody(bodyDef);

        var leftWall = new b2PolygonShape();
        leftWall.SetAsBoxXYCenterAngle(0.1, 1, new b2Vec2(1.3, 0), 0);
        body.CreateFixtureFromShape(leftWall, 5);

        var topWall = new b2PolygonShape();
        topWall.SetAsBoxXYCenterAngle(1.3, 0.1, new b2Vec2(0, 1.05), 0);
        body.CreateFixtureFromShape(topWall, 5);

        var rightWall = new b2PolygonShape();
        rightWall.SetAsBoxXYCenterAngle(0.1, 1, new b2Vec2(-1.3, 0), 0);
        body.CreateFixtureFromShape(rightWall, 5);

        var bottomWall = new b2PolygonShape();
        bottomWall.SetAsBoxXYCenterAngle(1.3, 0.1, new b2Vec2(0, -1.05), 0);
        body.CreateFixtureFromShape(bottomWall, 5);

        var psd = new b2ParticleSystemDef();
        psd.radius = 0.075;
        psd.dampingStrength = 0.5;

        var particleSystem = world.CreateParticleSystem(psd);
        var box = new b2PolygonShape();
        box.SetAsBoxXYCenterAngle(0.65, 0.65, new b2Vec2(0, 1.0), 0);

        var particleGroupDef = new b2ParticleGroupDef();
        particleGroupDef.shape = box;
        var particleGroup = particleSystem.CreateParticleGroup(particleGroupDef);
    }

    step() {
        world.Step(this.timeStep, this.velocityIterations, this.positionIterations);
    }

    moveMouse(x, y) {
        if (this.mouse) this.mouse.SetTransform(new b2Vec2(x - 0.05, y), 0);
    }

    getNumParticles() {
        return world.particleSystems[0].GetParticleCount();
    }

}

function clampNumber(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

function roundDownToIncrement(number, inc) {
    return Math.ceil(Math.abs(number / inc)) * inc;
}

class ObjectPool {
    constructor(fontSize, minWidth, maxWidth, widthInterval, minWeight, maxWeight,
        weightInterval, numParticles, baselineAmountPerCell, container) {

        this.fontSize = fontSize;

        this.minWidth = minWidth;
        this.maxWidth = maxWidth;
        this.widthInterval = widthInterval;

        this.minWeight = minWeight;
        this.maxWeight = maxWeight;
        this.weightInterval = weightInterval;

        this.numParticles = numParticles;
        this.baselineAmtPerCell = baselineAmountPerCell;
        this.container = container;

        /* contains all of the DOM elements
         * 3D array of DOM elements
         * width
         * -- weight
         * ---- pool of (width, weight) objects
         */
        this.objectPool = [];
        this.cellsInUse = []; //tracks cells in use so we don't resuse a cell in the same iteration

        this.setUpObjectPool();
    }

    makeWaveCell(width, weight) {
        let element = document.createElement("SPAN");
        element.innerHTML = ("<div>AG</div><div>UA</div>");
        element.classList.add("particle");
        element.style.fontVariationSettings = `"wght" ${weight}, "wdth" ${width}, "YTRA" 850`;
        element.style.fontSize = this.fontSize + "px";
        element.style.lineHeight = (this.fontSize * 0.7) + "px";
        element.style.transform = 'translate3D( 0px, 2000px, 0px)'; //start off the page
        this.container.appendChild(element);
        return [true, width, weight, element, ""]; //[if cell is available, HTMLelement, key]
    }

    setUpObjectPool() {
        for (var width = this.minWidth; width <= this.maxWidth; width += this.widthInterval) {
            let weightBucket = [];
            for (var weight = this.minWeight; weight <= this.maxWeight; weight += this.weightInterval) {
                let cellBucket = [];
                for (var cell = 0; cell < this.baselineAmtPerCell; cell++) {
                    let element = this.makeWaveCell(width, weight);
                    cellBucket.push(element);
                    if (this.cellsInUse.length < this.numParticles / 2) {
                        element[0] = false;
                        element[4] = `${cell} ${width}, ${weight}` //set key
                        this.cellsInUse.push(element);
                    }
                }
                weightBucket.push(cellBucket);
            }
            this.objectPool.push(weightBucket);
        }
    }

    grabCorrectObject(width, weight) {
        let clampedRoundedWidth = this.getMatchingWidth(width);
        let clampedRoundedWeight = this.getMatchingWeight(weight);

        let widthIndex = Math.floor((clampedRoundedWidth - this.minWidth) / this.widthInterval)
        let weightIndex = Math.floor((clampedRoundedWeight - this.minWeight) / this.weightInterval)


        let cells = this.objectPool[widthIndex][weightIndex].filter(cell => cell[0]);

        if (cells.length > 0) {
            let returnCell = cells[0];
            return returnCell;
        } else {
            let newCell = this.makeWaveCell(this.objectPool[widthIndex][weightIndex][0][1], this.objectPool[widthIndex][weightIndex][0][2]);
            this.objectPool[widthIndex][weightIndex].push(newCell);
            return newCell;
        }
    }

    getMatchingWidth(width) {
        return clampNumber(roundDownToIncrement(width, this.widthInterval), this.minWidth, this.maxWidth);
    }

    getMatchingWeight(weight) {
        return clampNumber(roundDownToIncrement(weight, this.weightInterval), this.minWeight, this.maxWeight);
    }
}


class WaveDemo {

    constructor() {

        this.animationRequest = null;
        this.windowWidth = document.getElementById("demo").clientWidth;
        this.windowHeight = document.getElementById("demo").clientHeight;


        //DOM elements
        this.container = document.getElementById("water-container");
        this.containerRect = this.container.getBoundingClientRect();
        this.mouseSquare = document.getElementById("mouse-square");
        this.mouseSquareRect = this.mouseSquare.getBoundingClientRect();

        //setup fluid sim
        var gravity = new b2Vec2(0, -10);
        var timeStep = 1.0 / 60.0;
        var velocityIterations = 8;
        var positionIterations = 3;
        var baselineAmtPerCell = 5;

        this.fluidSim = new FluidSimulation(world, timeStep, velocityIterations, positionIterations);

        this.fontSize = this.windowWidth / (35); //TODO - needs refinement for viewport
        this.waveXPositionOffset = this.windowWidth / 2 - this.fontSize / 2;
        this.waveXPositionScale = this.windowWidth / 2.5 * 1.1;
        this.waveYPositionOffset = this.windowHeight + this.fontSize / 2;
        this.waveYPositionScale = (this.windowWidth / 2.5) * 1.15;

        this.objectPool = new ObjectPool(this.fontSize, 45, 100, 5, 100, 900, 100, this.fluidSim.getNumParticles(), baselineAmtPerCell, this.container);
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
        this.windowWidth = document.getElementById("demo").clientWidth;
        this.windowHeight = document.getElementById("demo").clientHeight;

        this.waveXPositionOffset = this.windowWidth / 2 - this.fontSize / 2;
        this.waveXPositionScale = this.windowWidth / 2.5 * 1.1;
        this.waveYPositionOffset = this.windowHeight + this.fontSize / 2;
        this.waveYPositionScale = (this.windowWidth / 2.5) * 1.15;
    }

    drawParticleSystem(system) {
        var particles = system.GetPositionBuffer();
        var maxParticles = particles.length;

        this.objectPool.cellsInUse.map(cell => {
            cell[3].style.transform = 'translate3D( 0px, 2000px, 0px)'
            cell[0] = true;
        })

        this.objectPool.cellsInUse = []

        for (var i = 0; i < maxParticles; i += 2) {
            let positionVectorX = particles[i] * this.waveXPositionScale + this.waveXPositionOffset;
            let positionVectorY = -particles[i + 1] * this.waveYPositionScale + this.waveYPositionOffset;

            let partOneH = this.windowHeight * 1 / 2;
            let partTwoH = this.windowHeight - partOneH;

            let partOneW = this.windowWidth;
            let partTwoW = this.windowWidth - partOneH;

            let weight = 800 * (clampNumber(positionVectorY, partTwoH, this.windowHeight) - partTwoH) / (partOneH) + 100;
            let width = 55 * (clampNumber(positionVectorX, 0, this.windowWidth)) / (this.windowWidth) + 45;

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