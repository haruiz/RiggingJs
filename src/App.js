import React from 'react';
import './App.css';
import CameraViewer from "./components/CameraViewer";
import ModelViewer from "./components/ModelViewer";

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.model = null;
        this.state = {
            videoWidth: 300,
            videoHeight: 300
        }
    }

    render() {
        const {videoWidth, videoHeight} = this.state;
        return (
            <React.Fragment>
                <ModelViewer />
                <CameraViewer videoWidth={videoWidth} videoHeight={videoHeight} />
            </React.Fragment>
        );
    }
}

export default App;
