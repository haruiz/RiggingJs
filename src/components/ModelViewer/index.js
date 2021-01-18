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
       await this.editor.setModel("assets/characters/monster.fbx");
       // setTimeout(async () => {
       //         await this.editor.setModel("assets/characters/zombie-girl.fbx");
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
        faceLocation: store.AppReducer.faceLocation
    }
};
export default connect(mapStateToProps)(ModelViewer);
