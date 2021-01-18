import React from 'react';
import './style.css';
import CameraViewer from "../CameraViewer";
import ModelViewer from "../ModelViewer";
import PropTypes from "prop-types"
// import * as posenet from '@tensorflow-models/posenet';
// import * as posenet3d  from "../../core/posenet3d";
import * as facemesh from '@tensorflow-models/facemesh';
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
        this.facemeshModel = await facemesh.load(facemeshModelConfig);
    }
    componentDidMount=async ()=>{
        try {
            await this.loadModels();
        }
        catch (e) {
            console.log(`error loading the model ${e.toString()}`);
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
    computeFaceRotation(face){
        const {origin, rotationMatrix} = GeometryUtil.computeHeadPoseEstimation(face);
        const {pitch, yaw, roll} = math.rotationMatrixToEulerAngles(rotationMatrix);
        return {origin, rotationMatrix, pitch, yaw, roll}
    }
    camUpdateCallback=async (imageTensor,ctx, cam)=>{
        const {videoWidth, videoHeight, actions} = this.props;
        const {updateFaceLocation} = actions;
        if(this.facemeshModel){
            const faces = await this.facemeshModel.estimateFaces(
                imageTensor,
                FACEMESH_MODEL_RETURN_TENSORS,
                FACEMESH_MODEL_FLIP_HORIZONTAL);
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
                    } = this.computeFaceRotation(faceLoc)
                    console.log(pitch, yaw, roll)
                    updateFaceLocation({...faceLoc,pitch, yaw, roll});
                    VisUtil.drawAxis(ctx, origin, rotationMatrix);
                }
                else{
                    updateFaceLocation(null);
                }
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
