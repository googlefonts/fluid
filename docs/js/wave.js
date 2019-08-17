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

function FluidSimulation() {

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

  this.time = 0;

  var psd = new b2ParticleSystemDef();
  psd.radius = 0.065;
  psd.dampingStrength = 0.5;

  var particleSystem = world.CreateParticleSystem(psd);
  var box = new b2PolygonShape();
  box.SetAsBoxXYCenterAngle(0.65, 0.65, new b2Vec2(0, 1.0), 0);

  var particleGroupDef = new b2ParticleGroupDef();
  particleGroupDef.shape = box;
  var particleGroup = particleSystem.CreateParticleGroup(particleGroupDef);
}

FluidSimulation.prototype.Step = function() {
  world.Step(timeStep, velocityIterations, positionIterations);
  this.time += 1 / 60;
}

FluidSimulation.prototype.MoveMouse = function(x, y) {
  if(this.mouse) this.mouse.SetTransform(new b2Vec2(x - 0.05, y), 0);
}

var gravity = new b2Vec2(0, -10);
var timeStep = 1.0 / 60.0;
var velocityIterations = 8;
var positionIterations = 3;
var numToAdd = 5;

world = new b2World(gravity);
fluidSim = new FluidSimulation();
var numParticles = world.particleSystems[0].GetParticleCount();

//DOM elements
var container = document.getElementById("water-container");
let containerRect = container.getBoundingClientRect();
var mouseSquare = document.getElementById("mouse-square");
var mouseSquareRect = mouseSquare.getBoundingClientRect();
var objectPool = [];

let windowWidth = document.getElementById("demo").clientWidth;
let windowHeight = document.getElementById("demo").clientHeight;

const fontSize = windowWidth/(35); //TODO - needs refinement for viewport
const waveXPositionOffset = windowWidth/2 - fontSize/2;
const waveXPositionScale = windowWidth/2.5 * 1.1;
const waveYPositionOffset = windowHeight + fontSize/2;
const waveYPositionScale = (windowWidth/2.5) * 1.15;

//width axis
const minWidth = 45;
const maxWidth = 100;
const widthInterval = 5;

//weight axis
const minWeight = 100;
const maxWeight = 900;
const weightInterval = 100;

/* contains all of the DOM elements
* 3D array of DOM elements
* width
* -- weight
* ---- pool of (width, weight) objects
*/
const widthBuckets = [];

const baselineAmountPerCell = 4;
var cellsInUse = []; //tracks cells in use so we don't resuse a cell in the same iteration

function makeWaveCell(width, weight){
  let element = document.createElement("SPAN");
  element.innerHTML = ("<div>AG</div><div>UA</div>");
  element.classList.add("particle");
  element.style.fontVariationSettings = `"wght" ${weight}, "wdth" ${width}, "YTRA" 850`;
  element.style.fontSize = fontSize + "px";
  element.style.transform = 'translate3D( 0px, 2000px, 0px)'; //start off the page
  container.appendChild(element);
  return [true, width, weight, element, ""]; //[if cell is available, HTMLelement, key]
}

function setUpObjectPool(){
  for(var width = minWidth; width <= maxWidth; width+= widthInterval){
    let weightBucket = [];
    for(var weight = minWeight; weight <= maxWeight; weight+= weightInterval){
      let cellBucket = [];
      for(var cell = 0; cell < baselineAmountPerCell; cell++){
        let element = makeWaveCell(width, weight);
        cellBucket.push(element);
        if(cellsInUse.length < numParticles/2){
          element[0] = false;
          element[4] = `${cell} ${width}, ${weight}` //set key
          cellsInUse.push(element);
        }
      }
      weightBucket.push(cellBucket);
    }
    widthBuckets.push(weightBucket);
  }
}

function grabCorrectObject(width, weight){
  let clampedRoundedWidth = getMatchingWidth(width);
  let clampedRoundedWeight = getMatchingWeight(weight);

  let widthIndex = Math.floor((clampedRoundedWidth - minWidth)/widthInterval)
  let weightIndex = Math.floor((clampedRoundedWeight - minWeight)/weightInterval)
  let cells = widthBuckets[widthIndex][weightIndex].filter(cell => cell[0]);

  if(cells.length > 0){
    let returnCell = cells[0];
    return returnCell;
  } else {
    let newCell = makeWaveCell(widthBuckets[widthIndex][weightIndex][0][1], widthBuckets[widthIndex][weightIndex][0][2]);
    widthBuckets[widthIndex][weightIndex].push(newCell);
    return newCell;
  }
}

function roundDownToIncrement(number, inc){
  return Math.ceil(Math.abs(number/inc)) * inc;
}

function clampNumber(val, min, max){
  return Math.min(Math.max(val, min), max);
}

function getMatchingWidth(width){
  return clampNumber(roundDownToIncrement(width, widthInterval), minWidth, maxWidth);
}

function getMatchingWeight(weight){
  return clampNumber(roundDownToIncrement(weight, weightInterval), minWeight, maxWeight);
}

function drawParticleSystem(system) {
  var particles = system.GetPositionBuffer();
  var maxParticles = particles.length;
  transform = new b2Transform();
  transform.SetIdentity();

  cellsInUse.map(cell => {
    cell[3].style.transform = 'translate3D( 0px, 2000px, 0px)'
    cell[0] = true;
  })

  cellsInUse = []

  for (var i = 0; i < maxParticles; i += 2) {
    let positionVectorX = particles[i] * waveXPositionScale + waveXPositionOffset;
    let positionVectorY = -particles[i+1] * waveYPositionScale + waveYPositionOffset;

    let partOneH = windowHeight * 1/2;
    let partTwoH = windowHeight - partOneH;

    let partOneW = windowWidth;
    let partTwoW = windowWidth - partOneH;

    let weight = 800 * (clampNumber(positionVectorY, partTwoH, windowHeight) - partTwoH)/(partOneH) + 100;
    let width = 55 * (clampNumber(positionVectorX, 0, windowWidth))/(windowWidth) + 45;

    currentElement = grabCorrectObject(width, weight);
    currentElement[3].style.transform = 'translate3D(' + Math.floor(positionVectorX) + 'px,' + Math.floor(positionVectorY) + 'px, 1px)';
    currentElement[0] = false;

    cellsInUse.push(currentElement);
  }
}

container.addEventListener("mousemove", function(ele){
  const x = ele.clientX - containerRect.left;
  const y = ele.clientY - containerRect.top;
  mouseSquare.style.transform = `translate3d(${x - (mouseSquareRect.right - mouseSquareRect.left)/2}px, ${y}px, 0)`;
  fluidSim.MoveMouse((x - waveXPositionOffset)/waveXPositionScale, (waveYPositionOffset - y)/waveXPositionScale);
});

function step() {
  fluidSim.Step();
  drawParticleSystem(world.particleSystems[0]);
  requestAnimationFrame(step);
}

function recomputeBoundsWave(){
  containerRect = container.getBoundingClientRect();
  mouseSquareRect = mouseSquare.getBoundingClientRect();
  windowWidth = document.getElementById("demo").clientWidth;
  windowHeight = document.getElementById("demo").clientHeight;
}

//set up and start
setUpObjectPool();
requestAnimationFrame(step);
