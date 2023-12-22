import { VisualiserManager } from "../../../main.js";
import * as THREE from "../../../node_modules/three/build/three.module.js";
import { SetVector } from "../../utils/math-library.js";
import { CelestialOrbitalMotionLogic } from "../Components/OrbitalMechanics/CelestialOrbitalMotionLogic.js";
import { MaterialRenderer } from "../Components/Visual/MaterialRenderer.js";
import { GameObject } from "./GameObject.js";

export class Planet extends GameObject {
    constructor(planetCode, planetData) {
        super();

        // Components
        this.materialRenderer = new MaterialRenderer(planetCode);
        this.orbitalMotion = new CelestialOrbitalMotionLogic();
        this.planetState = new PlanetState(planetData.meanAnomaly, parseFloat(2459595.467857229989));

        // Fields
        this.planetCode = planetCode;
        this.planetData = planetData;
        this.orbitalPeriod = this.orbitalMotion.GetOrbitalPeriodInDays(planetData.semiMajorAxis);
        this.meanMotion = this.orbitalMotion.ConvertDegreesToRadians(this.orbitalMotion.GetMeanMotion(this.orbitalPeriod));
        // this.timeStep = this.orbitalMotion.CalculateTimeStep(this.orbitalPeriod);
        this.timeStep = 0.005;
        this.renderedObject = this.RenderPlanet();
    }

    // Updates the planet. Used during runtime.
    Update() {
        this.UpdateOrbitalState();
        this.SetPlanetPosition(this.renderedObject);
    }

    RenderPlanet() {
        const planet = new THREE.Mesh(
            new THREE.SphereGeometry(this.GetPlanetRadius(), 32, 16),
            this.materialRenderer.GetMaterial());

        this.SetPlanetPosition(planet);

        VisualiserManager().scene.add(planet);

        return planet;
    }

    SetPlanetPosition(planet) {
        const position = this.orbitalMotion.CalculateOrbitalMotionForPlanets(
            this.planetData.semiMajorAxis,
            this.planetData.eccentricity,
            this.planetData.inclination, // Try alternative method is the inclination of a given planet is less than 1 degree
            this.planetData.longitudeOfAscendingNode,
            this.planetData.argumentOfPerihelion,
            this.planetState.meanAnomaly,
            0.0000005);

        // const position = this.orbitalMotion.CalculateOrbitalMotionForPlanets(
        //     5.790913844411527E+07,
        //     2.056221646194238E-01,
        //     7.003602377484754E+00, // Try alternative method is the inclination of a given planet is less than 1 degree
        //     4.830273917477709E+01,
        //     2.919068100445978E+01,
        //     this.planetState.meanAnomaly,
        //     0.0000005);

        SetVector(planet, position);
    }

    GetState() {
        return this.planetState;
    }

    GetData() {
        return this.planetData;
    }

    GetCodeIdentifier() {
        return this.planetCode;
    }

    GetPlanetRadius() {
        return this.planetData.planetRadius * 0.0001; // TODO: ABstract this to make this dynamically scaled
    }

    UpdateOrbitalState() {
        this.planetState.currentTime += this.timeStep * VisualiserManager().gameState.timeMultiplier + 10;
        this.planetState.meanAnomaly = this.orbitalMotion.GetCurrentMeanAnomaly(
            3.004515994723365E+02,
            4.736503145221769E-05,
            this.planetState.currentTime);

        // console.log("MeanAnomaly: " + this.planetState.meanAnomaly + ", Mean Motion: " + this.meanMotion + ", CurrentTime: " + this.planetState.currentTime);
        // console.log("CurrentPosition: x = " + this.renderedObject.position.x + ", y = " + this.renderedObject.position.y + ", z = " + this.renderedObject.position.z);
    }
}

export class PlanetState {
    constructor(meanAnomaly, initialTime) {
        this.meanAnomaly = meanAnomaly;
        this.currentTime = 0;
    }
}
