import React from 'react';
import './style.css';
import CameraViewer from "../CameraViewer";
import ModelViewer from "../ModelViewer";
import PropTypes from "prop-types"

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.model = null;
    }
    render() {
        const {videoWidth, videoHeight} = this.props;
        return (
            <React.Fragment>
                <ModelViewer />
                <CameraViewer videoWidth={videoWidth} videoHeight={videoHeight} />
            </React.Fragment>
        );
    }
}

Index.propTypes = {
    videoWidth: PropTypes.number,
    videoHeight: PropTypes.number
};

Index.defaultProps = {
    videoWidth: 300,
    videoHeight: 300
};

export default Index;
