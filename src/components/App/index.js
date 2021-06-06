import React from 'react';
import './style.css';
import CameraViewer from "../CameraViewer";
import ModelViewer from "../ModelViewer";
import PropTypes from "prop-types"
// import * as posenet from '@tensorflow-models/posenet';
// import * as posenet3d  from "../../core/posenet3d";
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import "@tensorflow/tfjs-backend-webgl";
import VisUtil from "../../util/vis.util";
import {bindActionCreators} from "redux";
import * as actions from "../../redux/actions/appActions";
import {connect} from "react-redux";
import {math} from "../../util/imports";
import GeometryUtil from "../../util/geometry.util";
import * as tf from "@tensorflow/tfjs";

const FACEMESH_MODEL_RETURN_TENSORS = false;
const FACEMESH_MODEL_FLIP_HORIZONTAL = false;
const FACEMESH_MODEL_PREDICT_IRISES = false;
const FACEMESH_MODEL_MAX_FACES = 1;
const FACEMESH_MODEL_SCORE_THRESHOLD = 0.9;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.facemeshModel = null;
        this.posenet2d = null;
        this.posenet3d = null;
    }
    loadModels=async ()=>{

        this.facemeshModel = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
        );
        // this.posenet2dModel = await posenet.load({
        //     architecture: 'MobileNetV1',
        //     outputStride: 16,
        //     multiplier: 0.75
        // });
        //this.posenet3d = await posenet3d.load()

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
    drawFaceMeshModelPredictions=()=>{

    }
    camUpdateCallback=async (canvas,ctx, cam)=>{
        const {videoWidth, videoHeight, actions} = this.props;
        const {updateFaceLocation} = actions;
        if(this.facemeshModel){
            try {
                //console.log(tf.memory());
                tf.engine().startScope()
                let imageTensor = tf.browser.fromPixels(canvas)
                const faces = await this.facemeshModel.estimateFaces({
                    input: imageTensor,
                    returnTensors: FACEMESH_MODEL_RETURN_TENSORS,
                    flipHorizontal: FACEMESH_MODEL_FLIP_HORIZONTAL,
                    predictIrises: FACEMESH_MODEL_PREDICT_IRISES,
                    maxFaces: FACEMESH_MODEL_MAX_FACES,
                    scoreThreshold: FACEMESH_MODEL_SCORE_THRESHOLD
                });
                ctx.clearRect(0, 0, videoWidth, videoHeight);
                if (cam.isRunning) {
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
                        updateFaceLocation({...faceLoc, pitch, yaw, roll});
                        VisUtil.drawAxis(ctx, origin, rotationMatrix);
                    } else {
                        updateFaceLocation(null);
                    }
                    //const pose2d = await this.posenet2dModel.estimateSinglePose(imageTensor);
                    // if(pose2d.score > 0.2){
                    //     ctx.translate(0, 0);
                    //     VisUtil.drawPose(ctx, pose2d,
                    //         0.0, 0.5, 1, "green");
                    //     ctx.restore();
                    // }
                }
                tf.engine().endScope()

            } catch (e) {
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
