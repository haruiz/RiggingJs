import React from 'react';
import './style.css';
import CameraViewer from "../CameraViewer";
import ModelViewer from "../ModelViewer";
import PropTypes from "prop-types"
// import * as posenet from '@tensorflow-models/posenet';
// import * as posenet3d  from "../../core/posenet3d";
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import "@tensorflow/tfjs-backend-webgl";
import {facemeshModelConfig} from "../../util/models.config";
import VisUtil from "../../util/vis.util";
import {bindActionCreators} from "redux";
import * as actions from "../../redux/actions/appActions";
import {connect} from "react-redux";
import {math} from "../../util/imports";
import GeometryUtil from "../../util/geometry.util";

const FACEMESH_MODEL_RETURN_TENSORS = false;
const FACEMESH_MODEL_FLIP_HORIZONTAL = false;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.facemeshModel = null;
    }
    loadModels=async ()=>{
        this.facemeshModel = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
        );
        console.log(this.facemeshModel);
    }
    componentDidMount=async ()=>{
        try {
            await this.loadModels();
        }
        catch (e) {
            console.log(`error loading the model ${e.toString()}`, e);
        }
    }
    camStopCallback=(_)=>{
        const {actions} = this.props;
        const {updateFaceLocation} = actions;
        updateFaceLocation(null);
    }
    camStartCallback=(_)=> {
        const {actions} = this.props;
        const {updateFaceLocation} = actions;
        updateFaceLocation(null);
    }
    computeHeadRotation(face){
        const {origin, rotationMatrix} = GeometryUtil.computeHeadPoseEstimation(face);
        const {pitch, yaw, roll} = math.rotationMatrixToEulerAngles(rotationMatrix);
        return {origin, rotationMatrix, pitch, yaw, roll}
    }
    camUpdateCallback=async (imageTensor,ctx, cam)=>{
        const {videoWidth, videoHeight, actions} = this.props;
        const {updateFaceLocation} = actions;
        if(this.facemeshModel){
            try {
                const faces = await this.facemeshModel.estimateFaces({
                    input: imageTensor,
                    returnTensors: FACEMESH_MODEL_RETURN_TENSORS,
                    flipHorizontal: FACEMESH_MODEL_FLIP_HORIZONTAL,
                    predictIrises: false
                });
                ctx.clearRect(0, 0, videoWidth, videoHeight);
                //draw facemesh predictions
                if(cam.isRunning) {
                    if (faces && faces.length > 0) {
                        ctx.save();
                        ctx.translate(0, 0);
                        VisUtil.drawFace(ctx, faces[0]);
                        ctx.restore();
                        let faceLoc = faces[0];
                        const {
                            origin,
                            rotationMatrix,
                            pitch,
                            yaw,
                            roll
                        } = this.computeHeadRotation(faceLoc)
                        updateFaceLocation({...faceLoc,pitch, yaw, roll});
                        VisUtil.drawAxis(ctx, origin, rotationMatrix);
                    }
                    else{
                        updateFaceLocation(null);
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        }
    }

    render() {
        const {videoWidth, videoHeight} = this.props;
        return (
            <React.Fragment>
                <ModelViewer />
                <CameraViewer
                    videoWidth={videoWidth}
                    videoHeight={videoHeight}
                    updateCallback={this.camUpdateCallback}
                    stopCallback={this.camStopCallback}
                    startCallback={this.camStartCallback}
                />
            </React.Fragment>
        );
    }
}

App.propTypes = {
    videoWidth: PropTypes.number,
    videoHeight: PropTypes.number
};

App.defaultProps = {
    videoWidth: 300,
    videoHeight: 300
};

const mapStateToProps = (store, ownProps) => { return {}};
const mapDispatchToProps = (dispatch) => { return { actions: bindActionCreators(actions, dispatch) } };
export default connect(mapStateToProps, mapDispatchToProps)(App);
