import React from 'react';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import Stats  from 'three/examples/jsm/libs/stats.module';
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader"
import {connect} from "react-redux";
import * as dat from 'dat.gui';
import Scene from "../../util/scene";

class ModelViewer extends React.Component{
    constructor(props) {
        super(props);
        this.scene = new Scene(this);
    }
    componentDidMount=async()=>{
       await this.scene.init();
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
