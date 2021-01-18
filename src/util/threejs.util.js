import * as THREE from "three";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";

export default class ThreejsUtil {
    static async loadFbxModel(modelPath){
        let manager = new THREE.LoadingManager();
        manager.onStart = (item, loaded, total) => console.log('Loading started');
        manager.onLoad = () => console.log(`model ${modelPath} loaded successfully`);
        manager.onProgress = (item, loaded, total) => console.log(item, loaded, total);
        manager.onError = (url) => console.log('Error loading');
        let loader = new FBXLoader(manager);
        return new Promise((resolve, reject) => {
            loader.load(modelPath, (object) => {
                resolve(object);
            });
        });
    };
}
