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

class CameraViewer extends React.Component {
    constructor(props) {
        super(props);
        this.cam = null;
        // dom elements
        this.deviceSelectRef = React.createRef();
    }

    //camera events
    startCamera = async () => {
        const {videoWidth, videoHeight} = this.props;
        const deviceId = this.deviceSelectRef.current.selectedId();
        if (Camera.isSupported()) {
            const video = document.querySelector('video');
            this.cam = new Camera(video, videoHeight, videoWidth)
            await this.cam.start(deviceId);
            const canvas = document.getElementById('canvasVideo');
            const ctx = canvas.getContext('2d');
            canvas.width = videoWidth;
            canvas.height = videoHeight;
            let renderVideo = () => {
                let width = videoWidth;
                let height = videoHeight;
                ctx.clearRect(0, 0, width, height);
                ctx.save();
                ctx.scale(-1, 1);
                ctx.translate(-width, 0);
                // ctx.filter = 'blur(5px)';
                //ctx.filter = 'opacity(50%) blur(3px) grayscale(100%)';
                ctx.drawImage(video, 0, 0);
                // ctx.beginPath();
                // ctx.rect(0, 0, 100, 100);
                // ctx.stroke();
                ctx.restore();
                requestAnimationFrame(renderVideo);
            };
            renderVideo();
        } else {
            throw  new Error("Feature not supported");
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
                            <canvas id="canvasVideo"
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

export default CameraViewer;

