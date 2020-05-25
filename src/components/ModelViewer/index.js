import React from 'react';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import Stats  from 'three/examples/jsm/libs/stats.module';
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader"

export default class ModelViewer extends React.Component{
    camera = null;
    light1 = null;
    light2 = null;
    scene = null;
    model = null;
    renderer = null;
    mixer = null;
    cube = null;
    transformControls = null;
    orbitControls = null;
    stats = null;
    clock = null;
    constructor(props) {
        super(props);
    }
    createCamera=()=>{
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.set(0, 200, 200);
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
    animate = ()=> {
        requestAnimationFrame( this.animate );
        if(this.cube) {
            this.cube.rotation.x += 0.01;
            this.cube.rotation.y += 0.01;
        }
        if(this.mixer){
            let delta = this.clock.getDelta();
            this.mixer.update( delta );
        }
        this.renderer.render( this.scene, this.camera );
        this.stats.update();
    };
    createScene=()=>{
        //create scene
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
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
        let geometry = new THREE.BoxGeometry( 1, 1, 1 );
        let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        this.cube = new THREE.Mesh( geometry, material );
        this.cube.scale.set(20,20,20);
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
    goTroughSkeleton=(root)=>{
        this.addTransformControl(root);
        // let Head = root.getObjectByName( 'Head' );
        // this.addTransformControl(Head);

        // let Neck = root.getObjectByName( 'Neck' );
        // this.addTransformControl(Neck);
        //
        // let RightLeg = root.getObjectByName( 'RightLeg' );
        // this.addTransformControl(RightLeg);
        // let LeftLeg = root.getObjectByName( 'LeftLeg' );
        // this.addTransformControl(LeftLeg);
        //
        let LeftHand = root.getObjectByName( 'LeftHand' );
        console.log(LeftHand.children);
        this.addTransformControl(LeftHand);
        // let RightHand = root.getObjectByName( 'RightHand' );
        // this.addTransformControl(RightHand);
        //
        // let LeftFood = root.getObjectByName( 'LeftFood' );
        // this.addTransformControl(LeftFood);
        // let RightFoot = root.getObjectByName( 'RightFoot' );
        // this.addTransformControl(RightFoot);

        let RightFoot = root.getObjectByName( 'Neck1' );
        this.addTransformControl(RightFoot);



        // let RightArm = root.getObjectByName( 'RightArm' );
        // this.addTransformControl(RightArm);
        // let LeftArm = root.getObjectByName( 'LeftArm' );
        // this.addTransformControl(LeftArm);

        // let RightShoulder = root.getObjectByName( 'RightShoulder' );
        // this.addTransformControl(RightShoulder);
        // let LeftShoulder = root.getObjectByName( 'LeftShoulder' );
        // this.addTransformControl(LeftShoulder);


        // let ElbowShoulder = root.getObjectByName( 'RightShoulder' );
        // this.addTransformControl(RightShoulder);
        // let LeftShoulder = root.getObjectByName( 'LeftShoulder' );
        // this.addTransformControl(LeftShoulder);



        root.traverse((child) => {
            console.log(child.name);
        });
    };
    createSkeleton=(model)=> {
        model.traverse((child) => {
            if(child.type === "Bone") {
                console.log(child.name);
                let parentBone = child.parent.name;
                let currentBone = child.name;
                let bonesList = [
                    "LeftArm",
                    "RightArm",
                    "LeftLeg",
                    "RightLeg"
                ];
                if(bonesList.indexOf(parentBone) >= 0){
                    this.addTransformControl(child);
                }
                bonesList = [
                    "LeftHand",
                    "RightHand",
                    "Neck"
                ];
                if(bonesList.indexOf(currentBone) >= 0){
                    this.addTransformControl(child);
                }
            }
        });
    };
    loadCharacter=async ()=>{

        this.model = await this.loadFbxModel("models/girl.fbx");
        console.log(this.model);
        //let hip = this.model.getObjectByName( 'Hips' );
        this.createSkeleton(this.model);


        let skeleton = new THREE.SkeletonHelper( this.model );
        skeleton.visible = true;
        this.scene.add( skeleton );

        this.mixer = new THREE.AnimationMixer(this.model);
        let animations =  this.model.animations;
        if (animations.length > 0) {
            let action = this.mixer.clipAction(animations[0]);
            //action.play();
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
       await this.createGeometry();
       this.animate();
    };
    loadFbxModel=async(modelPath)=>{
        let loader  = new FBXLoader();
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