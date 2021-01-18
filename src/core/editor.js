import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats  from 'three/examples/jsm/libs/stats.module';
import AnimateCharacter from "./character";

export default class ModelEditor {

    get camera() {
        return this._camera;
    }

    get renderer() {
        return this._renderer;
    }

    get scene() {
        return this._scene;
    }

    /**
     * class constructor
     */
    constructor(component) {
        this._camera = null;
        this._renderer = null;
        this._mixer = null;
        this._orbitControls = null;
        this._stats = null;
        this._clock = new THREE.Clock();
        this._scene = new THREE.Scene();
        this.component = component;
        this._scene.background = new THREE.Color(0xa0a0a0);
        this._scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);
        this._character = new AnimateCharacter(this);
    }

    /**
     * setup the parameters of the camera, and add it to the scene
     */
    setupCamera(){
        let aspect = window.innerWidth / window.innerHeight;
        this._camera = new THREE.PerspectiveCamera(45,aspect, 1, 2000);
        this._camera.position.set(0, 200, 280);
        this._scene.add(this._camera);
    }

    /**
     * setup scene lighting
     */
    setupLights(){
        let light1 = new THREE.HemisphereLight(0xffffff, 0x444444);
        light1.position.set(0, 200, 0);
        this._scene.add(light1);
        let light2 = new THREE.DirectionalLight(0xffffff);
        light2.position.set(0, 200, 200);
        light2.castShadow = true;
        light2.shadow.camera.top = 180;
        light2.shadow.camera.bottom = -100;
        light2.shadow.camera.left = -120;
        light2.shadow.camera.right = 120;
        this._scene.add(light2);
    }

    /**
     * Setup scene controls
     */
    setupControls(){
        //scene controls
        this._orbitControls = new OrbitControls(this._camera, this._renderer.domElement);
        this._orbitControls.target.set(0, 100, 0);
        this._orbitControls.update();
    }


    /**
     * create the scene ground
     */
    setupGround(){
        // ground
        let floorGeometry = new THREE.PlaneBufferGeometry(
            2000,
            2000);
        let floorMaterial =new THREE.MeshPhongMaterial({
            color: 0x999999,
            depthWrite: false
        });
        let floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
        // define initial position
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.receiveShadow = true;
        // add floor to the scene
        this._scene.add(floorMesh);
    }

    /**
     * Setup renderer, witch is the object in charge of
     * draw the object in the scene and update their locations
     */
    setupRenderer(){

        //antialias: whether to perform antialiasing :  a technique for minimizing the distortion artifacts
        // known as aliasing when representing a high-resolution image at a lower resolution.
        // preserveDrawingBuffer: whether to preserve the buffers until manually cleared or overwritten.
        this._renderer = new THREE.WebGLRenderer({
            antialias: true, preserveDrawingBuffer: true});
        this._renderer.setPixelRatio(window.devicePixelRatio);
        // define viewport size
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        // enable shadows
        this._renderer.shadowMap.enabled = true;
        this._renderer.outputEncoding = THREE.sRGBEncoding;

        // create stats control
        this._stats = new Stats();
        this._stats.domElement.style.cssText = 'position:absolute;top:0px;right:0px;';

        // create the dom object where the scene will be rendered
        const container = document.createElement('div');
        // add the dom object to the html document
        document.body.appendChild(container);
        // append renderer to the dom object
        container.appendChild(this._renderer.domElement);
        // append stats control to the dom object
        container.appendChild(this._stats.dom);

        // we need to monitor the resizing event in the current window since we need to adjust the scene
        window.addEventListener('resize', this.onWindowResize, false);
    }


    /**
     * control the resizing of the window
     */
    onWindowResize=()=>{
        // update camera transformations
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        // update scene viewport
        this._renderer.setSize( window.innerWidth, window.innerHeight );
    };

    render=()=> {
        this._renderer.render(this._scene, this._camera);
    };
    /**
     * put animation logic here
     */
    update=()=> {
        this._stats.begin();
        /*********** PUT ANIMATION LOGIC HERE **********/
        if(this._character) {
            const {props} = this.component;
            const {faceLocation} = props;
            if (faceLocation) {
                this._character.stopAnimation();
                let neck = this._character.getBoneByName("Neck");
                if(neck) {
                    let {
                        pitch,
                        yaw,
                        roll
                    } = faceLocation;
                    pitch = Math.degrees(Math.asin(Math.sin(pitch)));
                    roll = Math.degrees(Math.asin(Math.sin(roll)));
                    yaw = Math.degrees(Math.asin(Math.sin(yaw)));
                    neck.rotation.y = Math.max(Math.min(yaw, Math.PI / 2), -Math.PI / 2);
                    neck.rotation.z = -Math.max(Math.min(roll, Math.PI / 2), -Math.PI / 2);
                    neck.rotation.x = -Math.max(Math.min(pitch, Math.PI / 2), -Math.PI / 2);
                }
            }
            else{
                //this._character.lookAtCamera();
                this._character.playAnimation();
            }
            //update character
            this._character.update(this._clock);
        }
        this._stats.end();
    };
    //animation loop
    animationLoop=()=>{
        this.update();
        this.render();
        this._orbitControls.update();
        requestAnimationFrame( this.animationLoop);
    };

    /**
     * Create scene helpers
     */
    setupHelpers(){
        //axis helper
        let axisHelper = new THREE.AxisHelper(200);
        this._scene.add(axisHelper);
        //grid helper
        let grid = new THREE.GridHelper(2000, 80, 0x000000, 0x000000);
        grid.material.opacity = 0.1;
        grid.material.transparent = true;
        this._scene.add(grid);
    }

    async setModel(model_path){
        await this._character.load(model_path);
        //this._character.playAnimation("mixamo.com");
    }

    /**
     * Initialize the scene asynchronously
     * @returns {Promise<void>}
     */
    init=async()=>{
        this.setupLights(); // step 1: lights
        this.setupCamera(); // step 2: cameras
        this.setupGround();    // initialize ground
        this.setupHelpers();
        this.setupRenderer(); // initialize renderer
        this.setupControls(); // initialize scene controls
        this.animationLoop(); //action!!!
    };
}
