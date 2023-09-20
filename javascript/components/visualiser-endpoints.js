import { SendAsync } from './ApiInvoker.js';

export const PlanetCodes = {
    Mercury : "199",
    Venus : "299",
    Earth : "399",
    Mars : "499",
    Jupiter : "599",
    Saturn : "699",
    Uranus : "799",
    Neptune : "899",
    Pluto : "999"
}

const HTTPMethods =  {
    GET : "GET",
    POST : "POST",
    PUT : "PUT",
    DELETE : "DELETE"
}

const ServerProxyURL = "http://localhost:8080/proxy?url="

export async function GetPlanetEphermerisData(planetCode) {
    const apiUri = ServerProxyURL
        + "https://ssd.jpl.nasa.gov/api/horizons.api?"
        + "Command=" + planetCode + "&OBJ_DATA=YES&MAKE_EPHEM=YES&EPHEM_TYPE=ELEMENTS&CENTER=500@10"; // TODO: Change this to a template literal

    try {
        const response = await SendAsync(HTTPMethods.GET, apiUri, true);

        // Split data into lines
        var lines = response.result.split("\n");

        // TODO: only take the primary data from the first section of the response, then extract key,value data from that
        // What needs to happen:
        // - Extract the required object data section (seperated by *)
        // - Seperate each data component from each line
        // - Create key, value pair seperated by (=)
        // - Add to dictionary
        // - Discard the rest of the data

        // TODO: Create NewHorizonsApi formatter so that we have specific functionality to handle the response.
        // TODO: Create an object to store this data instead of a dictionary

        const cleanedData = [];

        // Clean up the data
        for (const line of lines) {
            if (line.trim().startsWith('*') || !line.includes("=")) {
                continue;
            }

            if (line.includes("Column meaning:")) {
                break;
            }

            const cleanedLine = (line.replace(/\s*=\s*/g, '='));//.split(/\s{2,}/);

            const splitLine = cleanedLine.split(/\s{2,}/);
            cleanedData.push(splitLine);
        }

        console.log(cleanedData);

        // EXTRACT THE PHYSICAL DATA

        var physicalData = [];

        const keyValuePairRegex = /(\S.*?)\s*=\s*(.*?(?=\s+\S+\s*=|$))/g;
        for (const line of cleanedData) {
            // if (line.trim().startsWith('*') || !line.includes("=")) {
            //     continue;
            // }

            // if (line.startsWith('$') || line.includes("Ephemeris")) {
            //     break;
            // }

            // Clean up each line so its better for the key value pairs to be found
            // const cleanedLine = line.replace(/\s*=\s*/g, '=').trim();
            // const valuePairs = cleanedLine.match(keyValuePairRegex);
            // if (valuePairs != null) {
            //     valuePairs.forEach((valuePair) => {
            //         const key = valuePair.split("=")[0].trim();
            //         const value = valuePair.split("=")[1].trim();
            //         physicalData.push({key, value});
            //     });
            // }
        }

        // EXTRACT THE EPHERMERIS DATA
        console.log(physicalData);
        return lines
    } catch(error) {
        console.error(error);
    }
}

export async function GetSmallBodyAsteroids() {
    const apiUri = ServerProxyURL + "https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=Eros";

    await SendAsync(HTTPMethods.GET, apiUri, true);
}
