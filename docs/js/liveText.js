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

let animatingText = document.getElementById("text-one-fading");
let phrase = 0;

const phraseBank = [
"The spectacle before us was indeed sublime",
"Waves flung themselves at the blue evening",
"Silver mist suffused the deck of the ship",
"I watched the storm, so beautiful yet terrific"
];

function setup(){
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.class('hidden');
  noLoop();
}

// 0 -> 1
function upsidedownAbsolute(x){
  return 2 * Math.abs(x - 0.5) + 1;
}

function easeOutCubic(t) {
  t--;
  return t*t*t+1
};

function easeOutIn(x){
  return (Math.pow(-2 * Math.abs(x - 0.5), 3)+1);
}

let beachStep = 0;
let beachStepAmount = 3;
let waveStopped = false;

function increment(){
  beachStep += beachStepAmount;
}

function fragment(){
  animatingText.classList.remove("rebuild");
  animatingText.classList.add("fragment");
}

function rebuild(){
  animatingText.classList.remove("fade-in");
  animatingText.classList.remove("fragment");
  animatingText.classList.add("rebuild");
}

function fadeOut(){
  animatingText.classList.remove("fade-in");
  animatingText.classList.add("fade-out");
}

function fadeIn(){
  animatingText.classList.remove("fade-out");
  animatingText.classList.add("fade-in");
}

function stopWave(){
  waveStopped = true;
  beachStepAmount = 0;
}

function startWave(){
  waveStopped = false;
  beachStepAmount = 3;
}

function draw(){
  clear();

  let iScale = 150;
  let waveLength = 0.08;
  let xStop = windowWidth/2;
  increment();
  let xStep = xStop * easeOutIn(((beachStep)%xStop)/xStop) + windowWidth/3;
  if((((beachStep)%xStop)/xStop) > 0.15) {
    fragment();
  } else if( !waveStopped && (((beachStep)%xStop)/xStop) < 0.002){
    stopWave();
    setTimeout(()=>{
      fadeOut();
      setTimeout(()=>{
        animatingText.innerHTML = phraseBank[(phrase++)%3];
        fadeIn();
        setTimeout(()=>{
          rebuild();
          setTimeout(()=>{
            startWave();
          }, 8000)
        }, 1000)
      }, 1000)
    }, 1500)
  }

  let noiseModifier = frameCount/150;

  strokeWeight(2);
  stroke(255, 255, 255, 230);
  fill(200, 230, 255, 100);

  for(var j = 0; j < 3; j++){
    beginShape();
    vertex(0, 0)
    for(var i = 0; i < windowHeight; i++){
      vertex((600 * (noise(i/iScale + j * 0.5, noiseModifier ) + waveLength * sin(i/50))/3) + xStep, i);
    }
    vertex(0, windowHeight);
    endShape();
  }

  noFill();
  for(var j = 0; j < 5; j ++){
    strokeWeight(j/2);
    beginShape();
      for(var i = 0; i < windowHeight; i++){
        vertex((600 * (noise(i/iScale + j/5, noiseModifier ) + waveLength * sin(i/50))/3) + xStep, i);
      }
    endShape();
  }

  fill(160, 220, 255, 130);
  noStroke();
  beginShape();
  vertex(0, 0)
  for(var i = 0; i < windowHeight; i++){
    vertex((500 * (noise(i/iScale + 1, noiseModifier ) + waveLength * sin(i/50 + 1.6))/3) + xStep - 100, i);
  }
  vertex(0, windowHeight);
  endShape();

  fill(100, 200, 220, 60);
  noStroke();
  beginShape();
  vertex(0, 0)
  for(var i = 0; i < windowHeight; i++){
    vertex((400 * (noise(i/iScale + 3, noiseModifier ) + waveLength * sin(i/50))/3) + xStep - 300, i);
  }
  vertex(0, windowHeight);
  endShape();

  fill(230, 200, 200, 60);
  noStroke();
  beginShape();
  vertex(0, 0)
  for(var i = 0; i < windowHeight; i++){
    vertex((300 * (noise(i/iScale + 3, 0 ) + waveLength * sin(i/50))/3) + (windowWidth * 0.9), i);
  }
  vertex(0, windowHeight);
  endShape();

  fill("#356BBF11");
  noStroke();
  beginShape();
  vertex(0, 0)
  for(var i = 0; i < windowHeight; i++){
    vertex((300 * (noise(i/iScale + 3.5, noiseModifier/2 ) + waveLength * sin(i/50))/3) + (windowWidth * 0.2), i);
  }
  vertex(0, windowHeight);
  endShape();
}

