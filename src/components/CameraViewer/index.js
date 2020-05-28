import React from 'react';
import Camera from "../../util/camera";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import DeviceSelect from "../DeviceSelect";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import IconButton from "@material-ui/core/IconButton";
import PlayIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import Draggable from 'react-draggable';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import VideoCamIcon from '@material-ui/icons/Videocam';
import moment from "moment";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../../redux/actions/CameraViewerActions"
import VisUtil from "../../util/vis";
const tf = window.tf; //require("@tensorflow/tfjs-core");
const facemesh = window.facemesh;//require("@tensorflow-models/facemesh");


class CameraViewer extends React.Component {
    ctx = null;
    requestAnimation = null;
    constructor(props) {
        super(props);
        this.cam = null;
        this.facemeshTfModel =null;
        this.deviceSelectRef = React.createRef();
        this.canvasRef = React.createRef();

    }
    componentDidMount=async ()=>{
        try {
            this.facemeshTfModel = await facemesh.load({maxFaces: 1});
        }
        catch (e) {
            console.log(`error loading the model ${e.toString()}`);
        }
        this.ctx = this.canvasRef.current.getContext('2d');
    };

    //camera events
    startCamera = async () => {
        const {videoWidth, videoHeight, actions} = this.props;
        const deviceId = this.deviceSelectRef.current.selectedId();
        const canvas = this.canvasRef.current;

        if (Camera.isSupported()) {
            const video = document.querySelector('video');
            this.cam = new Camera(video, videoHeight, videoWidth);
            await this.cam.start(deviceId);
            let renderVideo = async() => {
                try {
                    if(this.cam.isRunning) {
                        //const input = tf.browser.fromPixels(canvas);
                        ///const faces = await this.facemeshTfModel.estimateFaces(input);
                        const faces = await this.facemeshTfModel.estimateFaces(video);
                        this.ctx.clearRect(0, 0, videoWidth,videoHeight);
                        this.ctx.save();
                        this.ctx.scale(-1, 1);
                        this.ctx.translate(-videoWidth, 0);
                        this.ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
                        if (faces && faces.length > 0) {
                            //VisUtil.drawMesh(this.ctx, faces[0]);
                            VisUtil.drawFace(this.ctx, faces[0]);

                            let mesh = faces[0].scaledMesh;
                            // left eye, based on the keypoints map
                            var [x1, y1, z1] = mesh[33];
                            var [x2, y2, z2] = mesh[133];
                            let p1 = {x: Math.round((x1 + x2) / 2), y: Math.round(y1), z: z1};
                            this.ctx.fillRect(p1.x, p1.y, 5, 5);
                            // right eye, based on the keypoints map
                            [x1, y1, z1] = mesh[362];
                            [x2, y2, z2] = mesh[263];
                            let p2 = {x: Math.round((x1 + x2) / 2), y: Math.round(y1), z: z1};
                            this.ctx.fillRect(p2.x, p2.y, 5, 5);
                            //noise tip
                            let annotations = faces[0].annotations;
                            var [x, y, z] = annotations["noseTip"][0];
                            let p3 = {x: Math.round(x), y: Math.round(y), z: z};
                            this.ctx.fillRect(p3.x, p3.y, 5, 5);

                            let distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
                            let headCenter = {'x':(p1.x + p2.x) / 2.0, 'y':(p1.y + p2.y) / 2.0};
                            this.ctx.fillRect(headCenter.x, headCenter.y, 10, 10);
                            actions.update_facemesh_keypoints(faces[0]);
                            //console.log(pitch, yaw, roll);
                            //await tf.nextFrame();
                        }
                        else{
                            actions.update_facemesh_keypoints(null);
                        }
                    }
                    //this.ctx.closePath();reducers
                    this.ctx.restore();

                }
                catch (e) {
                    console.log("render interrupted" + e.toString());
                }
                this.requestAnimation = requestAnimationFrame(renderVideo);
            };
            await renderVideo();
        } else {
            throw new Error("Feature not supported");
        }
    };
    stopCamera = async () => {
        if (this.cam && this.cam.isRunning) {
            await this.cam.stop();
        }
    };
    // controls events
    btnStartCamClickEvt = async () => {
        await this.stopCamera();
        await this.startCamera();
    };

    btnStopCamClickEvt = async () => {
        await this.stopCamera();
        if(this.requestAnimation) {
            cancelAnimationFrame(this.requestAnimation);
        }
    };

    render() {
        const {videoWidth, videoHeight} = this.props;
        return (
            <Draggable >
                <Card elevation={20} style={{ zIndex: 1, position: "absolute", top: 50, left: 50}}>
                    <CardHeader
                        style={{cursor: "move"}}
                        avatar={
                            <IconButton >
                                <VideoCamIcon fontSize="large" />
                            </IconButton>
                        }
                        action={
                            <IconButton>
                                <MoreVertIcon />
                            </IconButton>
                        }
                        title="Camera Viewer"
                        subheader={moment().format("MMM Do YY")}
                    />
                    <CardContent>
                    <Grid container
                          spacing={3}
                          direction="column"
                          alignItems="center"
                          justify="center"
                          style={{minHeight: '50h'}}>
                        <Grid item xs={12} style={{alignItems: "center"}}>
                            <video autoPlay style={{
                                transform: "scaleX(-1)",
                                display: "none"
                            }}/>
                            <canvas  ref={this.canvasRef}
                                    width={videoWidth}
                                    height={videoHeight}
                                    style={{backgroundColor: "gray"}}/>
                        </Grid>
                        <Grid item xs={12}>
                            <DeviceSelect ref={this.deviceSelectRef}/>
                        </Grid>
                        <Grid item xs={12}>
                            <ButtonGroup color="primary" aria-label="contained primary button group">
                                <IconButton onClick={this.btnStartCamClickEvt}>
                                    <PlayIcon fontSize="large"/>
                                </IconButton>
                                <IconButton onClick={this.btnStopCamClickEvt}>
                                    <StopIcon fontSize="large"/>
                                </IconButton>
                            </ButtonGroup>
                        </Grid>
                    </Grid>
                    </CardContent>
                </Card>
            </Draggable>

        )
    }
}

CameraViewer.defaultProps = {
    videoWidth: 300,
    videoHeight: 300
};
const mapStateToProps = (store, ownProps) => { return {}};
const mapDispatchToProps = (dispatch) => { return { actions: bindActionCreators(actions, dispatch) } };
export default connect(mapStateToProps, mapDispatchToProps)(CameraViewer);


