import React from 'react';
import Camera from "../../core/camera";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

export default class DeviceSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            devicesList: [],
            deviceId: ""
        };
    }
    selectedId=()=>{
      return this.state.deviceId;
    };
    componentDidMount = async () => {
        await this.fetchDevicesList();
    };
    fetchDevicesList = async () => {
        const devices = await Camera.devicesList();
        this.setState({
            devicesList: devices
        })
    };
    onChangeHandler=(event)=>{
        this.setState({
            deviceId: event.target.value
        })
    };
    render() {
        const {devicesList, deviceId} = this.state;
        const items = devicesList.map((d, i) =>
            <MenuItem key={i} value={d.id}>{d.label}</MenuItem>
        );
        return (<Select label="Select the camera" value={deviceId} onChange={this.onChangeHandler} style={{minWidth: 280}}>
            {items}
        </Select>);
    }
}
