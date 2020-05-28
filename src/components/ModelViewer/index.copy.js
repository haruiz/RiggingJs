import React from 'react';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import Stats  from 'three/examples/jsm/libs/stats.module';
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader"
import {connect} from "react-redux";
import * as dat from 'dat.gui';

class ModelViewer extends React.Component{
    camera = null;
    light1 = null;
    light2 = null;
    scene = null;
    model = null;
    renderer = null;
    mixer = null;
    cube = null;
    orbitControls = null;
    stats = null;
    clock = null;
    modelName = null;
    defaultAnimation;
    constructor(props) {
        super(props);
    }
    createCamera=()=>{
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.set(0, 200, 280);
        this.scene.add(this.camera);
    };
    createLights=()=>{
        // lights
        this.light1 = new THREE.HemisphereLight(0xffffff, 0x444444);
        this.light1.position.set(0, 200, 0);
        this.scene.add(this.light1);
        //light2
        this.light2 = new THREE.DirectionalLight(0xffffff);
        this.light2.position.set(0, 200, 200);
        this.light2.castShadow = true;
        this.light2.shadow.camera.top = 180;
        this.light2.shadow.camera.bottom = -100;
        this.light2.shadow.camera.left = -120;
        this.light2.shadow.camera.right = 120;
        this.scene.add(this.light2);
    };

    createHelpers=()=>{
        let grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        this.scene.add(grid);
        //axis
        let axisHelper = new THREE.AxisHelper(200);
        this.scene.add(axisHelper);
    };

    createRenderer=()=>{
        //renderer
        let container = document.createElement('div');
        document.body.appendChild(container);
        this.renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);
        this.stats = new Stats();
        this.stats.domElement.style.cssText = 'position:absolute;top:0px;right:0px;';
        container.appendChild(this.stats.dom);
        window.addEventListener('resize', this.onWindowResize, false);
    };
    animate =()=> {

        // if(this.cube) {
        //     this.cube.rotation.x += 0.01;
        //     this.cube.rotation.y += 0.01;
        // }
        if(this.mixer){
            let delta = this.clock.getDelta();
            this.mixer.update( delta );
        }
        if(this.model){
            const t = this.clock.getElapsedTime();
            const {facemesh_keypoints} = this.props;
            let neck = this.getBoneByName("Neck");
            if(neck) {
                if (facemesh_keypoints) {
                    // if(this.defaultAnimation)
                    //     this.defaultAnimation.stop();
                    let mesh = facemesh_keypoints.scaledMesh;
                    let annotations = facemesh_keypoints.annotations;

                    // left eye, based on the keypoints map
                    var [x1, y1, z1] = mesh[33];
                    var [x2, y2, z2] = mesh[133];
                    let p1 = {x: Math.round((x1 + x2) / 2), y: Math.round(y1), z: z1};

                    // right eye, based on the keypoints map
                    [x1, y1, z1] = mesh[362];
                    [x2, y2, z2] = mesh[263];
                    let p2 = {x: Math.round((x1 + x2) / 2), y: Math.round(y1), z: z1};

                    //noise tip
                    var [x, y, z] = annotations["noseTip"][0];
                    let p3 = {x: Math.round(x), y: Math.round(y), z: z};

                    let distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
                    distance = distance + 12;
                    let headCenter = {'x': (p1.x + p2.x) / 2.0, 'y': (p1.y + p2.y) / 2.0};


                    //let newY = (headCenter.x - p3.x)/(distance/15);
                    //let newY = (headCenter.y - p3.y)/(distance/15);
                    function map(original, in_min, in_max, out_min, out_max) {
                        return (original - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
                    }

                    let newY = map(p3.y,distance*2.0,distance*2.8,-1.0,1);
                    let newX = (headCenter.x - p3.x) / (distance / 15);

                    neck.rotation.y = Math.max(Math.min(newX, Math.PI / 2), -Math.PI / 2);
                    neck.rotation.x = Math.max(Math.min(newY, Math.PI / 2), -Math.PI / 2);

                    // let noiseTip = facemesh_keypoints["noseTip"][0];
                    // let pitch = noiseTip[0]* Math.PI / 180;
                    // let yaw = noiseTip[1]* Math.PI / 180;
                    // let roll = noiseTip[2]* Math.PI / 180;
                    // console.log(pitch, yaw, roll);
                    //neck.rotation.x = pitch;
                    //neck.rotation.y = yaw;
                    //neck.rotation.z =roll;
                     // neck.rotation.y = Math.max(
                    //     Math.min( newY, Math.PI / 2 ),
                    //     - Math.PI / 2 );

                    // neck.rotation.z = Math.max(
                    //     Math.min( neck.rotation.z, Math.PI / 4 ),
                    //     - Math.PI / 4 );
                    //Math.cos( t ) * 0.01;
                    // neck.rotation.y += Math.cos( t ) * 0.01;
                    //console.log(Math.cos( t ) * 0.01);
                    //neck.rotation.z += Math.cos( t ) * 0.01;
                } else {
                    // if(this.defaultAnimation)
                    //     this.defaultAnimation.play();
                    neck.rotation.set(0,0,0);
                }
            }
            //this.lookAtCamera();
            requestAnimationFrame( this.animate );

        }
        this.renderer.render( this.scene, this.camera );
        this.stats.update();
    };
    createScene=()=>{
        //create scene
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa0a0a0);
        this.scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);
        // ground
        let mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2000, 2000),
            new THREE.MeshPhongMaterial({
                color: 0x999999,
                depthWrite: false
            }));
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
    };
    createGeometry=async()=>{
        // create example cube
        // let geometry = new THREE.BoxGeometry( 1, 1, 1 );
        // let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        // this.cube = new THREE.Mesh( geometry, material );
        // this.cube.scale.set(20,20,20);
        //this.scene.add(this.cube );
        // load character
        await this.loadCharacter();
    };
    createControls=()=>{
        //scene controls
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.target.set(0, 100, 0);
        this.orbitControls.update();
        //model controls
        this.transformControls = new TransformControls( this.camera, this.renderer.domElement );
        this.scene.add( this.transformControls );
    };
    addTransformControl=( bone )=>{
        var control = new TransformControls( this.camera, this.renderer.domElement );
        control.attach( bone );
        this.scene.add( control );
    };
    lookAtCamera=( )=> {
        var neck = this.getBoneByName( "Neck");
        var tmpVector = new THREE.Vector3();
        this.camera.getWorldPosition( tmpVector );
        tmpVector.y -= 15;  // heuristic
        neck.lookAt( tmpVector );
        neck.rotation.x = Math.max(
            Math.min( neck.rotation.x, Math.PI / 2 ),
            - Math.PI / 2 );
        neck.rotation.y = Math.max(
            Math.min( neck.rotation.y, Math.PI / 2 ),
            - Math.PI / 2 );
        neck.rotation.z = Math.max(
            Math.min( neck.rotation.z, Math.PI / 4 ),
            - Math.PI / 4 );
    };
    getBoneByName=(boneName)=>{
        let hips = this.model.getObjectByName(`${this.modelName}Hips`);
        return hips.getObjectByName(`${this.modelName}${boneName}`);
    };
    createSkeletonControllers=(model)=> {
        let rootBone = model.children.find(child => child.type === "Bone");
        if(rootBone) {
            let index = rootBone.name.indexOf("Hips");
            if(index >= 0) {
                var modelName = rootBone.name;
                modelName =modelName.substring(0,index);
                this.modelName = modelName;
                rootBone.traverse((child) => {
                    //console.log(child.name);
                    if (child.type === "Bone") {
                        let parentBone = child.parent.name;
                        let currentBone = child.name;
                        let bonesList = [
                            "LeftArm",
                            "RightArm",
                            "LeftLeg",
                            "RightLeg"
                        ];
                        bonesList = bonesList.map(v => `${modelName}${v}`);
                        if(bonesList.indexOf(parentBone) >= 0){
                            this.addTransformControl(child);
                        }
                        bonesList = [
                            "LeftHand",
                            "RightHand",
                            "Neck"
                        ];
                        bonesList = bonesList.map(v => `${modelName}${v}`);
                        if(bonesList.indexOf(currentBone) >= 0){
                            this.addTransformControl(child);
                        }
                    }
                });
            }
        }
    };

    loadCharacter=async ()=>{

        this.model = await this.loadFbxModel("models/monster.fbx");
        // add skeleton controls
        this.createSkeletonControllers(this.model);
        let skeleton = new THREE.SkeletonHelper( this.model );
        skeleton.visible = true;
        this.scene.add( skeleton );

        this.mixer = new THREE.AnimationMixer(this.model);
        let animations =  this.model.animations;
        if (animations.length > 0) {
            let mixamoAnimation = animations.find(a => a.name === "mixamo.com");
            this.defaultAnimation = this.mixer.clipAction(mixamoAnimation);
            //this.defaultAnimation.play();
        }

        this.model.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        this.model.position.set(0,0,0);
        let bbox = new THREE.Box3().setFromObject(this.model);
        let bboxWidth = bbox.max.z - bbox.min.z;
        let bboxHeight = bbox.max.x - bbox.min.x;
        let bboxDepth = bbox.max.y - bbox.min.y;
        if(bboxHeight < 50)
            this.model.scale.set(200, 200, 200);
        //let boxHelper = new THREE.BoxHelper( this.model, 0xffff00 );
        //this.scene.add( boxHelper );
        this.scene.add(this.model);
    };
    componentDidMount=async()=>{
       this.createScene();
       this.createCamera();
       this.createLights();
       this.createHelpers();
       this.createRenderer();
       this.createControls();
       this.createGUI();
       await this.createGeometry();
       this.animate();
    };
    createGUI=async()=>{
        // https://workshop.chromeexperiments.com/examples/gui/#8--Custom-Placement
        const datGui  = new dat.GUI({ autoPlace: true });
        datGui.domElement.id = 'gui';
        let folder = datGui.addFolder(`Model`);
        let palette = {
            color1: '#FF0000', // CSS string
            color2: [ 0, 128, 255 ], // RGB array
            color3: [ 0, 128, 255, 0.3 ], // RGB with alpha
            color4: { h: 350, s: 0.9, v: 0.3 } // Hue, saturation, value
        };
        folder.addColor(palette, 'color1');
        folder.addColor(palette, 'color2');
        folder.addColor(palette, 'color3');
        folder.addColor(palette, 'color4');
        var FizzyText = function() {
            this.message = 'pizza';
            this.displayOutline = false;
        };
        let text = new FizzyText();
        folder.add(text, 'message', [ 'pizza', 'chrome', 'hooray' ] );
        folder.add(text, 'displayOutline');


    };
    loadFbxModel=async(modelPath)=>{
        var manager = new THREE.LoadingManager();
        manager.onStart =(item, loaded, total)=> console.log('Loading started');
        manager.onLoad = ()=> console.log("model loaded");
        manager.onProgress = (item, loaded, total)=> console.log(item, loaded, total);
        manager.onError = (url)=>  console.log('Error loading');
        let loader  = new FBXLoader(manager);
        return new Promise((resolve, reject)=>{
            loader.load(modelPath, (object)=>{
               resolve(object);
            });
        });
    };
    onWindowResize=()=>{
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    };
    render() {
        return(
            <div />
        )
    }
}
const mapStateToProps = (store, _) => {
    return {
        facemesh_keypoints: store.CameraViewerReducer.facemesh_keypoints
    }
};
export default connect(mapStateToProps)(ModelViewer);
