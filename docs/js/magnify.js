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

class MagnifyDemo {

    constructor() {

        this.grid = [];
        this.gridXDimension = 20;
        this.gridYDimension = 20;
        this.allowance = 0.6;

        this.rippleVfContainer = document.getElementById("vf-container");
        this.magnifyingGlassContainer = document.getElementById("magnifying-glass-container");
        this.magnifyingGlass = document.getElementById("magnifying-glass");
        this.mouseCircle = document.getElementById("mouse-circle");

        this.unblurContainer = document.getElementById("unblur-container");
        this.unblurContainerRect = this.unblurContainer.getBoundingClientRect();
        this.unblur = document.getElementById("unblur");

        this.unblurStaticRect = document.getElementById("unblur-static").getBoundingClientRect();

        this.rippleVfContainerRect = this.rippleVfContainer.getBoundingClientRect();
        this.containerWidth = this.rippleVfContainerRect.right - this.rippleVfContainerRect.left;
        this.containerHeight = this.rippleVfContainerRect.bottom - this.rippleVfContainerRect.top;

        this.magnifyingGlassRect = this.magnifyingGlassContainer.getBoundingClientRect();
        this.magnifyingGlassWidth = this.magnifyingGlassRect.right - this.magnifyingGlassRect.left;
        this.magnifyingGlassHeight = this.magnifyingGlassRect.bottom - this.magnifyingGlassRect.top;

        this.mouseCircleRect = this.mouseCircle.getBoundingClientRect();
        this.mouseCircleWidth = this.mouseCircleRect.right - this.mouseCircleRect.left;
        this.mouseCircleHeight = this.mouseCircleRect.bottom - this.mouseCircleRect.top;

        this.grid = [];

        this.setUpGrid(this.rippleVfContainer, "a", 20, 20);

        this.grid = [];

        this.setUpGrid(this.magnifyingGlass, "a", 11, 11);

        document.getElementById("demo-magnify").addEventListener("mousemove", (evt) => this.moveMouseHandler(evt))
        this.setupGlass();
    }

    setupGlass() {
        for (var i = 0; i < 11; i++) {
            let cellsWithinRadius = this.grid.filter(cell => Math.abs(this.calculateDistanceFromOrigin(5, 5, cell) - i) < this.allowance)
            cellsWithinRadius.map(cell => {
                cell[0].style.fontSize = (32 - i * 3) + "px";
                cell[0].style.fontVariationSettings = `"opsz" ${(32 - i * 3)}, "GRAD" ${(1 - i * 0.2)}`;
            })
        }
    }

    calculateDistanceFromOrigin(originX, originY, cell) {
        return Math.sqrt((cell[1] - originX) ** 2 + (cell[2] - originY) ** 2);
    }

    makeCell(rowContainer, letter, x, y) {
        let element = document.createElement("SPAN");
        element.innerHTML = letter;
        rowContainer.appendChild(element);
        return [element, x, y];
    }

    setUpGrid(element, gridContent, gridX, gridY) {
        let gridContentSplit = gridContent.split("");
        for (var y = 0; y < gridY; y++) {
            let rowHTMLElement = document.createElement("DIV");
            for (var x = 0; x < gridY; x++) {
                this.grid.push(this.makeCell(rowHTMLElement, gridContentSplit[(x + y) % gridContent.length], x, y))
            }
            element.appendChild(rowHTMLElement);
        }
    }

    //needed for toggling demos from display none
    recomputeBounds() {
        this.unblurContainerRect = this.unblurContainer.getBoundingClientRect();
        this.unblurStaticRect = document.getElementById("unblur-static").getBoundingClientRect();
        this.rippleVfContainerRect = this.rippleVfContainer.getBoundingClientRect();
        this.containerWidth = this.rippleVfContainerRect.right - this.rippleVfContainerRect.left;
        this.containerHeight = this.rippleVfContainerRect.bottom - this.rippleVfContainerRect.top;
        this.magnifyingGlassRect = this.magnifyingGlassContainer.getBoundingClientRect();
        this.magnifyingGlassWidth = this.magnifyingGlassRect.right - this.magnifyingGlassRect.left;
        this.magnifyingGlassHeight = this.magnifyingGlassRect.bottom - this.magnifyingGlassRect.top;
        this.mouseCircleRect = this.mouseCircle.getBoundingClientRect();
        this.mouseCircleWidth = this.mouseCircleRect.right - this.mouseCircleRect.left;
        this.mouseCircleHeight = this.mouseCircleRect.bottom - this.mouseCircleRect.top;
    }

    start() {
        this.recomputeBounds();
    }

    onResize() {
        this.recomputeBounds();
    }

    stop() {
        //do nothing
    }


    moveMouseHandler(evt) {
        let evtX = evt.clientX - this.rippleVfContainerRect.left;
        let evtY = evt.clientY - this.rippleVfContainerRect.top;
        this.magnifyingGlassContainer.style.transform = `translate3d(${evtX - this.magnifyingGlassWidth/2}px, ${evtY- this.magnifyingGlassHeight/2}px, 0px)`
        let x = Math.floor((evtX) / (Math.abs(this.containerWidth / this.gridXDimension)));
        let y = Math.floor((evtY) / (Math.abs(this.containerHeight / this.gridYDimension)));

        let properXPosition = x * (Math.abs(this.containerWidth / this.gridXDimension));
        let properYPosition = y * (Math.abs(this.containerHeight / this.gridYDimension));

        let xOffset = properXPosition - evtX;
        let yOffset = properYPosition - evtY;

        this.magnifyingGlass.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0px)`;

        evtX = evt.clientX - this.unblurStaticRect.left;
        evtY = evt.clientY - this.unblurStaticRect.top;

        this.unblurContainer.style.transform = `translate3d(${evtX - this.magnifyingGlassWidth/2}px, ${evtY- this.magnifyingGlassHeight/2 + 35}px, 0px)`;
        this.unblur.style.transform = `translate3d(${(this.unblurStaticRect.left + this.magnifyingGlassWidth/2) - evt.clientX}px, ${(this.unblurStaticRect.top + this.magnifyingGlassWidth/2) - evt.clientY}px, 0px)`

        this.mouseCircle.style.transform = `translate3d(${evt.clientX - this.magnifyingGlassWidth/2}px, ${evt.clientY - this.magnifyingGlassHeight/2}px, 0px)`;
    }
}