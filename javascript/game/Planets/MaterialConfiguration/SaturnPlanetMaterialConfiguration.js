import * as THREE from "three";
import { DefaultPlanetColor } from "../../../shared/Enumerations/DefaultPlanetColor.js";
import { MaterialConfiguration, TextureMaps } from "../../Base/MaterialConfiguration.js";

class SaturnPlanetMaterialConfiguration extends MaterialConfiguration {
    constructor() {
        super();

        this.key = "699";
        this.defaultMaterial = new THREE.MeshStandardMaterial({ color: DefaultPlanetColor.Saturn });
        this.ringConfiguration = {
            textureConfiguration: {
                textureMaps: new TextureMaps({
                    albedoPath: "../../../../../images/Planets/Saturn/saturn-ring-albedo.png"
                })
            }
        };
        this.textureConfiguration = {
            textureMaps: new TextureMaps({
                albedoPath: "../../../../../images/Planets/Saturn/saturn-albedo.jpg"
            })
        };
    }
}

export { SaturnPlanetMaterialConfiguration };
