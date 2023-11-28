import { VisualiserManager } from "../../../main.js";
import * as THREE from "../../../node_modules/three/build/three.module.js";
import { SetVector } from "../../utils/math-library.js";
import { CelestialOrbitalMotionLogic } from "../Components/OrbitalMechanics/CelestialOrbitalMotionLogic.js";
import { MaterialRenderer } from "../Components/Visual/MaterialRenderer.js";
import { GameObject } from "../Entities/GameObject.js";

class Comet extends GameObject {
    constructor(cometData) {
        super();

        // Components
        this.cometState = new CometState(cometData.meanAnomaly, cometData.timeOfPerihelion);
        this.materialRenderer = new MaterialRenderer();
        this.orbitalMotion = new CelestialOrbitalMotionLogic(); // As a temporory fix for visualisation

        // Fields
        this.cometData = cometData;
        this.orbitalPeriod = this.orbitalMotion.GetOrbitalPeriodInDays(cometData.semiMajorAxis);
        this.meanMotion = this.orbitalMotion.ConvertDegreesToRadians(this.cometData.meanMotion);
        this.timeStep = this.orbitalMotion.CalculateTimeStep(this.orbitalPeriod);
        this.renderedObject = this.Render();
    }

    Update() {
        this.UpdateOrbitalState();
        this.SetAsteroidPosition(this.renderedObject);
    }

    Render() {
        const comet = new THREE.Mesh(
            new THREE.SphereGeometry(this.GetRadius(), 32, 16),
            this.materialRenderer.GetMaterial());

        // This is temporary until we have proper orbital calculations and scaling relative to the sun and positions of the planets.
        this.SetAsteroidPosition(comet);

        VisualiserManager().scene.add(comet);

        return comet;
    }

    SetAsteroidPosition(comet) {
        const position = this.orbitalMotion.CalculateOrbitalPosition(
            this.cometData.semiMajorAxis,
            this.cometData.eccentricity,
            this.cometData.inclination,
            this.cometData.longitudeOfTheAscendingNode,
            this.cometData.argumentOfPerihelion,
            this.cometState.meanAnomaly,
            100);

        SetVector(comet, position);
    }

    GetRadius() {
        return 1; // Default radius as many object have a no default radius in the data
    }

    UpdateOrbitalState() {
        this.cometState.currentTime += this.timeStep;
        this.cometState.meanAnomaly = this.orbitalMotion.CalculateMeanAnomaly(
            this.cometData.meanAnomaly,
            this.meanMotion,
            this.cometState.currentTime,
            this.cometData.timeOfPerihelion);
    }
}

/**
 * This holds the runtime metadata for the Asteroid.
 */
class CometState {
    constructor(meanAnomaly, initialTime) {
        this.meanAnomaly = meanAnomaly;
        this.currentTime = initialTime;
    }
}

export { Comet, CometState };
