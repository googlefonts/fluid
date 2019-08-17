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

var rippleVfContainer = document.getElementById("vf-container");
var magnifyingGlassContainer = document.getElementById("magnifying-glass-container");
var magnifyingGlass = document.getElementById("magnifying-glass");
var mouseCircle = document.getElementById("mouse-circle");

var unblurContainer = document.getElementById("unblur-container");
var unblurContainerRect = unblurContainer.getBoundingClientRect();
var unblur = document.getElementById("unblur");

var unblurStaticRect = document.getElementById("unblur-static").getBoundingClientRect();

var rippleVfContainerRect = rippleVfContainer.getBoundingClientRect();
var containerWidth = rippleVfContainerRect.right - rippleVfContainerRect.left;
var containerHeight = rippleVfContainerRect.bottom - rippleVfContainerRect.top;

var magnifyingGlassRect = magnifyingGlassContainer.getBoundingClientRect();
var magnifyingGlassWidth = magnifyingGlassRect.right - magnifyingGlassRect.left;
var magnifyingGlassHeight = magnifyingGlassRect.bottom - magnifyingGlassRect.top;

var mouseCircleRect = mouseCircle.getBoundingClientRect();
var mouseCircleWidth = mouseCircleRect.right - mouseCircleRect.left;
var mouseCircleHeight = mouseCircleRect.bottom - mouseCircleRect.top;

//needed for toggling demos from display none
function recomputeBoundsForMagnify(){
  unblurContainerRect = unblurContainer.getBoundingClientRect();
  unblurStaticRect = document.getElementById("unblur-static").getBoundingClientRect();
  rippleVfContainerRect = rippleVfContainer.getBoundingClientRect();
  containerWidth = rippleVfContainerRect.right - rippleVfContainerRect.left;
  containerHeight = rippleVfContainerRect.bottom - rippleVfContainerRect.top;
  magnifyingGlassRect = magnifyingGlassContainer.getBoundingClientRect();
  magnifyingGlassWidth = magnifyingGlassRect.right - magnifyingGlassRect.left;
  magnifyingGlassHeight = magnifyingGlassRect.bottom - magnifyingGlassRect.top;
  mouseCircleRect = mouseCircle.getBoundingClientRect();
  mouseCircleWidth = mouseCircleRect.right - mouseCircleRect.left;
  mouseCircleHeight = mouseCircleRect.bottom - mouseCircleRect.top;
}

/***** GRID SETUP ****/
var mGrid = [];
var mGridXDimension = 20;
var mGridYDimension = 20;
const allowance = 0.6;

function makeCell(rowContainer, letter, x, y){
  let element = document.createElement("SPAN");
  element.innerHTML = letter;
  rowContainer.appendChild(element);
  return [element, x, y];
}

function setUpGrid(element, mGridContent, mGridX, mGridY){
  let mGridContentSplit = mGridContent.split("");
  for(var y = 0; y < mGridY; y++){
    let rowHTMLElement = document.createElement("DIV");
    for(var x = 0; x < mGridY; x++){
      mGrid.push(makeCell(rowHTMLElement, mGridContentSplit[(x + y) % mGridContent.length], x, y))
    }
    element.appendChild(rowHTMLElement);
  }
}

function calculateDistanceFromOrigin(originX, originY, cell){
  return Math.sqrt((cell[1] - originX) ** 2 + (cell[2] - originY) ** 2);
}

setUpGrid(rippleVfContainer, "a", 20, 20);

mGrid = [];
setUpGrid(magnifyingGlass, "a", 11, 11);

function setupGlass(){
  for(var i = 0; i < 11; i++){
    let cellsWithinRadius = mGrid.filter(cell => Math.abs(calculateDistanceFromOrigin(5, 5, cell) - i) < allowance )
    cellsWithinRadius.map(cell => {
      cell[0].style.fontSize = (32 - i * 3) + "px";
      cell[0].style.fontVariationSettings = `"opsz" ${(32 - i * 3)}, "GRAD" ${(1 - i * 0.2)}`;
    })
  }
}

setupGlass();

document.getElementById("demo-magnify").addEventListener("mousemove", function(evt){
  let evtX = evt.clientX - rippleVfContainerRect.left;
  let evtY = evt.clientY - rippleVfContainerRect.top;
  magnifyingGlassContainer.style.transform = `translate3d(${evtX - magnifyingGlassWidth/2}px, ${evtY- magnifyingGlassHeight/2}px, 0px)`
  let x = Math.floor((evtX)/(Math.abs(containerWidth/mGridXDimension)));
  let y = Math.floor((evtY)/(Math.abs(containerHeight/mGridYDimension)));

  let properXPosition = x * (Math.abs(containerWidth/mGridXDimension));
  let properYPosition = y * (Math.abs(containerHeight/mGridYDimension));

  let xOffset = properXPosition - evtX;
  let yOffset = properYPosition - evtY;

  magnifyingGlass.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0px)`;

  evtX = evt.clientX - unblurStaticRect.left;
  evtY = evt.clientY - unblurStaticRect.top;

  unblurContainer.style.transform = `translate3d(${evtX - magnifyingGlassWidth/2}px, ${evtY- magnifyingGlassHeight/2 + 35}px, 0px)`;
  unblur.style.transform = `translate3d(${(unblurStaticRect.left + magnifyingGlassWidth/2) - evt.clientX}px, ${(unblurStaticRect.top + magnifyingGlassWidth/2) - evt.clientY}px, 0px)`

  mouseCircle.style.transform = `translate3d(${evt.clientX - magnifyingGlassWidth/2}px, ${evt.clientY - magnifyingGlassHeight/2}px, 0px)`;

})
