import React from 'react';
import Grid from "@material-ui/core/Grid";
import DevicePicker from "../DevicePicker";
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
import {CircularProgress} from "@material-ui/core";
import PropTypes from "prop-types";
import Camera from "../../core/camera";
import * as tf from '@tensorflow/tfjs';
import {requestAnimationFrame, cancelAnimationFrame} from "../../util/imports";

class CameraViewer extends React.Component {

    constructor(props) {
        super(props);
        this.cam = null;
        this.devicePickerRef = React.createRef();
        this.videoCanvasRef = React.createRef();
        this.drawCanvasRef = React.createRef();
        this.videoRef = React.createRef();
        // canvas contexts
        this.videoCanvasCtx = null;
        this.drawCanvasCtx = null;
        // request animation
        this.requestAnimation = null;
        this.state = {
            isLoading : true
        }
    }
    componentDidMount=async ()=>{
        this.videoCanvasCtx = this.videoCanvasRef.current.getContext('2d');
        this.drawCanvasCtx = this.drawCanvasRef.current.getContext('2d');
    };
    clearCanvas(){
        const {videoWidth, videoHeight} = this.props;
        this.videoCanvasCtx.clearRect(0, 0, videoWidth, videoHeight);
        this.drawCanvasCtx.clearRect(0, 0, videoWidth, videoHeight);
    }
    renderLoop=async()=>{
        const {videoWidth, videoHeight, updateCallback} = this.props;
        const video = this.videoRef.current;
        const canvas = this.videoCanvasRef.current;
        try {
            if(this.cam && this.cam.isRunning){
                this.videoCanvasCtx.clearRect(0, 0, videoWidth, videoHeight);
                this.videoCanvasCtx.save();
                this.videoCanvasCtx.translate(videoWidth, 0);
                this.videoCanvasCtx.scale(-1, 1);
                this.videoCanvasCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
                this.videoCanvasCtx.restore();
                if(updateCallback){
                    await updateCallback(canvas, this.drawCanvasCtx, this.cam)
                }
            }
            else{
                this.clearCanvas();
                cancelAnimationFrame(this.requestAnimation); // kill animation
                return;
            }
        }
        catch (e){
            console.log(`render interrupted ${e.toString()}`);
        }
        this.requestAnimation = requestAnimationFrame(this.renderLoop);
    }
    /**
     * start the camera stream
     * @returns {Promise<void>}
     */
    startCamera = async () => {
        const {videoWidth, videoHeight, startCallback} = this.props;
        const deviceId = this.devicePickerRef.current.selectedId();
        if (Camera.isSupported()) {
            if (deviceId) {
                const video = this.videoRef.current;
                this.cam = new Camera(video, videoHeight, videoWidth);
                await this.cam.start(deviceId);
                if(startCallback){
                    startCallback(this.cam);
                }
                this.renderLoop();
            }
        }
        else {
            throw new Error("Camera in not supported, please try with another browser");
        }
    }
    /**
     * stop the camera stream
     * @returns {Promise<void>}
     */
    stopCamera = async () => {
        const {stopCallback} = this.props;
        if (this.cam && this.cam.isRunning) {
            await this.cam.stop();
        }
        this.clearCanvas();
        if(stopCallback){
            stopCallback(this.cam);
        }
    };
    btnStartCamClickEvt = async () => {
        try{
            if(this.cam && this.cam.isRunning)
                await this.stopCamera();
            await this.startCamera();
        }
        catch (e) {
            console.log(`error starting the camera ${e}`);
        }
    };
    btnStopCamClickEvt = async () => {
        try{
            await this.stopCamera();
        }
        catch (e) {
            console.log(`error stopping the camera ${e}`);
        }
    };
    renderControls() {
        const {isLoading} = this.state;
        let childComponent;
        if(isLoading){
            childComponent = <CircularProgress disableShrink style={{margin: 20 }} />
        }
        else{
            childComponent  = (
                <ButtonGroup color="primary" aria-label="contained primary button group">
                    <IconButton onClick={this.btnStartCamClickEvt} disabled={isLoading}>
                        <PlayIcon fontSize="large"/>
                    </IconButton>
                    <IconButton onClick={this.btnStopCamClickEvt} disabled={isLoading}>
                        <StopIcon fontSize="large"/>
                    </IconButton>
                </ButtonGroup>
            )
        }
        return <Grid container
                     spacing={0}
                     direction="column"
                     alignItems="center"
                     justify="center">
            <Grid item xs={12}>
                <DevicePicker ref={this.devicePickerRef} onLoaded={() => this.setState({ isLoading: false })}/>
            </Grid>
            <Grid item xs={12}>
                {childComponent}
            </Grid>
        </Grid>;
    }
    renderCamera(){
        const {videoWidth, videoHeight} = this.props;
        const wrapperStyle = {
            position: "relative",
            width: videoWidth,
            height: videoHeight
        };
        const wrapperCanvasStyle = {
            position: "absolute",
            top: 0,
            left: 0
        };
            return(
            <React.Fragment>
                <video
                    ref={this.videoRef}
                    autoPlay style={{
                    transform: "scaleX(-1)",
                    display: "none"
                }}/>
                <div style={wrapperStyle}>
                    <canvas ref={this.videoCanvasRef}
                            width={videoWidth}
                            height={videoHeight}
                            style={{...wrapperCanvasStyle, ...{backgroundColor: "gray"}}}/>
                    <canvas ref={this.drawCanvasRef}
                            width={videoWidth}
                            height={videoHeight}
                            style={wrapperCanvasStyle}/>
                </div>
            </React.Fragment>
        )
    }

    render() {

        return (
            <Draggable>
                <Card elevation={20} style={{zIndex: 1, position: "absolute", top: 50, left: 50}}>
                    <CardHeader
                        style={{cursor: "move"}}
                        avatar={
                            <IconButton>
                                <VideoCamIcon fontSize="large"/>
                            </IconButton>
                        }
                        action={
                            <IconButton>
                                <MoreVertIcon/>
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
                                {this.renderCamera()}
                            </Grid>
                            <Grid item xs={12}>
                                {this.renderControls()}
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Draggable>
        )
    }
}

CameraViewer.propTypes = {
    videoWidth: PropTypes.number,
    videoHeight: PropTypes.number,
    updateCallback: PropTypes.func,
    stopCallback: PropTypes.func,
    startCallback: PropTypes.func
};

CameraViewer.defaultProps = {
    videoWidth: 300,
    videoHeight: 300
};

export default CameraViewer;


