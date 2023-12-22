import { VisualiserManager } from "../../../../main.js";

class CelestialOrbitalMotionLogic {
    constructor() {
        this.PI = 3.14159265;
        this.STARMASS = 1.989e30 * 6.67430e-11;
        this.GRAVITATIONALCONSTANT = 6.67430e-11;
        this.STARMASS = 1.989e30;
        this.GRAVITATIONALMASS = 1.989e30 * 6.67430e-11;
    }

    GetOrbitalPeriodInDays(semiMajorAxis) {
        // Source for calculating the orbital period from: https://en.wikipedia.org/wiki/Orbital_period
        return 2 * this.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / this.GRAVITATIONALMASS);
    }

    CalculateTimeStep(orbitalPeriod) {
        // Calculates the time step assuming synchronous sidereal rotation. Orbital Period = Sidereal Day Period.
        return orbitalPeriod / (orbitalPeriod * 24 * 3600) * VisualiserManager().gameState.timeStepResolution;
    }

    GetTimeStepInDays(orbitalPeriod, sideRealDayPeriod) {
        return orbitalPeriod / (sideRealDayPeriod * 24 * 3600) * VisualiserManager().gameState.timeStepResolution;
    }

    // TODO: Move this a custom math library
    ConvertDegreesToRadians(degrees) {
        return degrees * this.PI / 180;
    }

    GetMeanMotion(orbitalPeriod) {
        return 2 * this.PI / orbitalPeriod;
    }

    CalculateMeanAnomaly(meanAnomaly, meanMotion, time, timeOfPerihelionPassage) {
        // Source for defining the mean anomaly from: https://en.wikipedia.org/wiki/Mean_anomaly
        return meanAnomaly + meanMotion * (time - timeOfPerihelionPassage);
    }

    GetCurrentMeanAnomaly(meanAnomaly, meanMotion, currentTime) {
        return meanAnomaly + meanMotion * currentTime;
    }

    CalculateOrbitalPosition(
        semiMajorAxis,
        eccentricity,
        inclination,
        longitudeOfAscendingNode,
        argumentOfPerihelion,
        meanAnomaly,
        distanceScale) {
        const eccentricAnomaly = this.CalculateEccentricAnomaly(meanAnomaly, eccentricity);

        // Calculates the angular parameter representing the position of the body along a Keplerian Orbit.
        // Source: https://en.wikipedia.org/wiki/True_anomaly
        //      See 'From the eccentric anomaly' section.
        const trueAnomaly = 2 * Math.atan(Math.sqrt((1 + eccentricity) / (1 - eccentricity)) * Math.tan(eccentricAnomaly / 2));

        // Calculates the radius from the sun in astronomical units (au).
        const distanceRadiusFromSun = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));

        const positionWithinOrbitalPlane = {
            x: (distanceRadiusFromSun * Math.cos(trueAnomaly)),
            y: 0,
            z: (distanceRadiusFromSun * Math.sin(trueAnomaly))
        };

        // Convert to 3D space coordinates - modified to use x and z as the orbital plane.
        //      - This relies on the cartesian coordinate system, which this converts from the originate 'orbital plane coordinate system'
        // Source: https://en.wikipedia.org/wiki/Orbital_elements
        //      See 'Euler angle transformation'
        const positionIn3DSpace = {
            // x' * (cos(Ω) * cos(ω) - sin(Ω) * sin(ω) * cos(i)) - y' * (cos(Ω) * sin(ω) + sin(Ω) * cos(ω) * cos(i))
            x: (positionWithinOrbitalPlane.x * (Math.cos(longitudeOfAscendingNode) * Math.cos(argumentOfPerihelion) -
                Math.sin(longitudeOfAscendingNode) * Math.sin(argumentOfPerihelion) * Math.cos(inclination)) -
                positionWithinOrbitalPlane.z * (Math.cos(longitudeOfAscendingNode) * Math.sin(argumentOfPerihelion) +
                    Math.sin(longitudeOfAscendingNode) * Math.cos(argumentOfPerihelion) * Math.cos(inclination))),
            // x' * sin(ω) * sin(i) + y' * cos(ω) * sin(i)
            y: positionWithinOrbitalPlane.x * Math.sin(argumentOfPerihelion) * Math.sin(inclination) +
                positionWithinOrbitalPlane.z * Math.cos(argumentOfPerihelion) * Math.sin(inclination),
            // x' * (sin(Ω) * cos(ω) + cos(Ω) * sin(ω) * cos(i)) + y' * (sin(Ω) * sin(ω) - cos(Ω) * cos(ω) * cos(i))
            z: (positionWithinOrbitalPlane.x * (Math.sin(longitudeOfAscendingNode) * Math.cos(argumentOfPerihelion) +
                Math.cos(longitudeOfAscendingNode) * Math.sin(argumentOfPerihelion) * Math.cos(inclination)) +
                positionWithinOrbitalPlane.z * (Math.sin(longitudeOfAscendingNode) * Math.sin(argumentOfPerihelion) -
                    Math.cos(longitudeOfAscendingNode) * Math.cos(argumentOfPerihelion) * Math.cos(inclination)))
        };

        positionIn3DSpace.x *= distanceScale;
        positionIn3DSpace.y *= distanceScale;
        positionIn3DSpace.z *= distanceScale;

        return positionIn3DSpace;
    }

    CalculateOrbitalMotionForPlanets(
        semiMajorAxis,
        eccentricity,
        inclination,
        longitudeOfAscendingNode,
        argumentOfPerihelion,
        meanAnomaly,
        distanceScale) {
        const eccentricAnomaly = this.CalculateEccentricAnomaly(meanAnomaly, eccentricity);

        // Calculates the angular parameter representing the position of the body along a Keplerian Orbit.
        // Source: https://en.wikipedia.org/wiki/True_anomaly
        //      See 'From the eccentric anomaly' sec tion.
        const trueAnomaly = 2 * Math.atan(Math.sqrt((1 + eccentricity) / (1 - eccentricity)) * Math.tan(eccentricAnomaly / 2));
        const trueAnomalyInDegrees = (180 / Math.PI) * trueAnomaly;
        // Calculates the radius from the sun in astronomical units (au).
        const distanceRadiusFromSun = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));

        const newPosition = {
            x: distanceRadiusFromSun * (Math.cos(longitudeOfAscendingNode) * Math.cos(argumentOfPerihelion + trueAnomalyInDegrees) -
                Math.sin(longitudeOfAscendingNode) * Math.sin(argumentOfPerihelion + trueAnomalyInDegrees) * Math.cos(inclination)),
            y: distanceRadiusFromSun * (Math.sin(argumentOfPerihelion + trueAnomalyInDegrees) * Math.sin(inclination)),
            z: distanceRadiusFromSun * (Math.sin(longitudeOfAscendingNode) * Math.cos(argumentOfPerihelion + trueAnomalyInDegrees) +
                Math.cos(longitudeOfAscendingNode) * Math.sin(argumentOfPerihelion + trueAnomalyInDegrees) * Math.cos(inclination))
        };

        console.log("Inclination is: " + inclination + ", y position is: " + newPosition.y);

        newPosition.x *= distanceScale;
        newPosition.y *= distanceScale;
        newPosition.z *= distanceScale;

        return newPosition;
    }

    CalculateEccentricAnomaly(meanAnomaly, eccentricity) {
        /**
         * Calculation is based on numerical analysis to find better approximations of the eccentric anomaly.
         * A root finding algorithm is applied to produce successive iterations of the initial eccentric anomaly.
         * Iterations solve to produce a value below the tolerance of 1e-12. Indicating a convergence to an accurate value.
         *
         * Calculation is based on the Newton-Raphson method:
         *      See 'From Mean Anomaly' section: https://en.wikipedia.org/wiki/Eccentric_anomaly
         *      See 'Newton's method' for approximate calculations: https://en.wikipedia.org/wiki/Newton%27s_method
         */

        let eccentricAnomaly = meanAnomaly;
        let deltaE = 1; // Initialize deltaE to a non-zero value.

        const maxIterations = 1000;
        let iterations = 0;

        while (Math.abs(deltaE) > 1e-12 && iterations < maxIterations) {
            deltaE = (eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly) / (1 - eccentricity * Math.cos(eccentricAnomaly));
            eccentricAnomaly -= deltaE;
            iterations++;

            // Check for NaN or infinity in eccentricAnomaly.
            if (!isFinite(eccentricAnomaly) || isNaN(eccentricAnomaly)) {
                console.log("Detected NaN or infinity during calculation of eccentric anomaly.");
                break;
            }
        }

        return eccentricAnomaly;
    }
}

export { CelestialOrbitalMotionLogic };
