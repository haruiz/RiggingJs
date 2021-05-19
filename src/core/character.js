import * as THREE from "three";
import ThreejsUtil from "../util/threejs.util";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";

export default  class AnimateCharacter {
    constructor(editor) {
        this._fbxModel = null;
        this._skeletonHelper = null;
        this._animationMixer = null;
        this._currentAnimation = null;
        this._skeletonControllers = null;
        this._modelName = null;
        this._editor = editor;

    }

    /**
     * return the current animation running
     * @returns {null}
     */
    get currentAnimation() {
        return this._currentAnimation;
    }

    /**
     * find a bone in the skeleton by name recursively
     * @param boneName: name of the bone
     * @param rootBone: main rot bone
     * @returns {Object3D}
     */
    getBoneByName=(boneName, rootBone="Hips")=>{
        let hips = this._fbxModel.getObjectByName(`${this._modelName}${rootBone}`);
        return hips.getObjectByName(`${this._modelName}${boneName}`);
    };

    addTransformControl=( bone )=>{
        let control = new TransformControls( this._editor.camera, this._editor.renderer.domElement );
        control.attach( bone );
        this._skeletonControllers.push(control);
        this._editor.scene.add( control );
    };
    /**
     * add skeleton controllers to the scene
     */
    setupSkeletonControllers=()=> {
        this._skeletonControllers = [];
        let rootBone = this._fbxModel.children.find(child => child.type === "Bone");
        if(rootBone) {
            let index = rootBone.name.indexOf("Hips");
            if(index >= 0) {
                var modelName = rootBone.name;
                modelName =modelName.substring(0,index);
                this._modelName = modelName;
                rootBone.traverse((child) => {
                    //console.log(child.name, child.children);
                    if (child.type === "Bone") {
                        //this.addTransformControl(child);
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
    remove(){
        if(this._fbxModel){
            this._editor.scene.remove( this._fbxModel );
            this._editor.scene.remove( this._skeletonHelper );
            for (let i = 0; i < this._skeletonControllers.length; i++) {
                this._editor.scene.remove(this._skeletonControllers[i]);
            }
        }
    }
    /**
     * replace/load a fbx posenet3d
     * @param model_path: .fbx file
     * @returns {Promise<void>}
     */
    async load(model_path){
        this.remove();
        this._fbxModel = await ThreejsUtil.loadFbxModel(model_path);
        this._fbxModel.position.set(0,0,0);
        this._fbxModel.traverse(function (child) {
            if (child.isMesh) {
                //child.material.alphaTest = 0;
                //child.material.side = THREE.DoubleSide;
                child.material.transparent = false;
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.color.set( 0xffffff );
            }
        });

        this._skeletonHelper = new THREE.SkeletonHelper( this._fbxModel);
        this._skeletonHelper.visible = true;
        this.setupSkeletonControllers();

        this._editor.scene.add( this._skeletonHelper );
        this._editor.scene.add(this._fbxModel);
        this._animationMixer = new THREE.AnimationMixer(this._fbxModel);

    }

    /**
     * play the established default animation, or what the user pick
     * @param animationName
     */
    playAnimation(animationName="mixamo.com"){
        if(this._fbxModel) {
            let animations = this._fbxModel.animations;
            if (animations.length > 0) {
                let targetAnimation = animations.find(a => a.name === animationName);
                if (targetAnimation) {
                    this._currentAnimation = this._animationMixer.clipAction(targetAnimation);
                    this._currentAnimation.play();
                }
            }
        }
    }

    /**
     * stop current animation
     */
    stopAnimation(){
        if(this._currentAnimation){
            this._currentAnimation.stop();
        }
    }
    /**
     * update animation
     * @param clock
     */
    update(clock){
        if(this._animationMixer){
            let delta = clock.getDelta();
            this._animationMixer.update( delta );
        }
    }
    //method that make the posenet3d follow the camera
    lookAtCamera=( )=> {
        if(this._fbxModel) {
            let neck = this.getBoneByName("Neck");
            let tmpVector = new THREE.Vector3();
            this._editor.camera.getWorldPosition(tmpVector);
            tmpVector.y -= 15;  // heuristic
            neck.lookAt(tmpVector);
            neck.rotation.x = Math.max(
                Math.min(neck.rotation.x, Math.PI / 2),
                -Math.PI / 2);
            neck.rotation.y = Math.max(
                Math.min(neck.rotation.y, Math.PI / 2),
                -Math.PI / 2);
            neck.rotation.z = Math.max(
                Math.min(neck.rotation.z, Math.PI / 4),
                -Math.PI / 4);
        }
    };
}
