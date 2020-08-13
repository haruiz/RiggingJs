import React from 'react';
import {connect} from "react-redux";
import ModelEditor from "../../core/editor";

class ModelViewer extends React.Component{
    constructor(props) {
        super(props);
        this.editor = new ModelEditor(this);

    }
    componentDidMount=async()=>{
       await this.editor.init();
       await this.editor.setModel("models/monster.fbx");
       // setTimeout(async () => {
       //         await this.editor.setModel("models/zombie-girl.fbx");
       //     },
       //     20000);

    };

    render() {
        return(
            <div />
        )
    }
}
const mapStateToProps = (store, _) => {
    return {
        facemesh_keypoints: store.CameraViewerReducer.facemesh_keypoints,
        head_rotation: store.CameraViewerReducer.head_rotation,
        pose_keypoints: store.CameraViewerReducer.posenet_keypoints,
        body_rotation: store.CameraViewerReducer.body_rotation,
    }
};
export default connect(mapStateToProps)(ModelViewer);
