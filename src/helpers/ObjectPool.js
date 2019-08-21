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
        element.style.transform = 'translate3D( 0px, 2000px, 0px)'; //start wayyyyyy off the page
        this.container.appendChild(element);
        return [true, width, weight, element, ""]; 
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

module.exports.ObjectPool = ObjectPool;
module.exports.clampNumber = clampNumber;