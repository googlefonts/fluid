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

class Painter {
    constructor(can, ctx) {
        this.canvas = can;
        this.context = ctx;
    }

    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    fillStyle(fillHex) {
        this.context.fillStyle = fillHex;
    }

    strokeStyle(strokeHex) {
        this.context.strokeStyle = strokeHex;

    }

    setOpacity(a) {
        this.context.globalAlpha = a;
    }

    lineWidth(wid) {
        this.context.lineWidth = wid;
    }

    begin() {
        this.context.beginPath();
    }

    drawFill() {
        this.context.fill();
    }

    drawStroke() {
        this.context.stroke();
    }

    vertex(x, y) {
        this.context.lineTo(x, y);
    }

}

module.exports.Painter = Painter;