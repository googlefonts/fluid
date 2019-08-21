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

class FluidSimulation {

    constructor(world, timeStep, velocityIterations, positionIterations) {

        //world should be global at this point, but if not
        if(world === null) world = new b2World(gravity);

        this.timeStep = timeStep;
        this.velocityIterations = velocityIterations;
        this.positionIterations = positionIterations;

        let bodyDef = new b2BodyDef();
        let ground = world.CreateBody(bodyDef);

        let mouseDef = new b2BodyDef();
        mouseDef.type = b2_staticBody;
        mouseDef.position.Set(0, 2);
        let mouseBody = world.CreateBody(mouseDef);
        this.mouse = mouseBody;

        let mouseShape = new b2PolygonShape();
        mouseShape.SetAsBoxXY(0.05, 0.05);
        mouseBody.CreateFixtureFromShape(mouseShape, 5);

        bodyDef.type = b2_staticBody;
        bodyDef.position.Set(0, 1);
        let body = world.CreateBody(bodyDef);

        let leftWall = new b2PolygonShape();
        leftWall.SetAsBoxXYCenterAngle(0.1, 1, new b2Vec2(1.3, 0), 0);
        body.CreateFixtureFromShape(leftWall, 5);

        let topWall = new b2PolygonShape();
        topWall.SetAsBoxXYCenterAngle(1.3, 0.1, new b2Vec2(0, 1.05), 0);
        body.CreateFixtureFromShape(topWall, 5);

        let rightWall = new b2PolygonShape();
        rightWall.SetAsBoxXYCenterAngle(0.1, 1, new b2Vec2(-1.3, 0), 0);
        body.CreateFixtureFromShape(rightWall, 5);

        let bottomWall = new b2PolygonShape();
        bottomWall.SetAsBoxXYCenterAngle(1.3, 0.1, new b2Vec2(0, -1.05), 0);
        body.CreateFixtureFromShape(bottomWall, 5);

        let psd = new b2ParticleSystemDef();
        psd.radius = 0.075;
        psd.dampingStrength = 0.5;

        let particleSystem = world.CreateParticleSystem(psd);
        let box = new b2PolygonShape();
        box.SetAsBoxXYCenterAngle(0.65, 0.65, new b2Vec2(0, 1.0), 0);

        let particleGroupDef = new b2ParticleGroupDef();
        particleGroupDef.shape = box;
        let particleGroup = particleSystem.CreateParticleGroup(particleGroupDef);
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

module.exports.FluidSimulation = FluidSimulation;