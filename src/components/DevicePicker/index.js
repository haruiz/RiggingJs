import React from 'react';
import Camera from "../../core/camera";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import PropTypes from "prop-types";

class DevicePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            devicesList: [],
            disabled: true,
            deviceId: null
        };
    }
    selectedId = () => {
        return this.state.deviceId;
    };
    componentDidMount = async () => {
        await this.fetchDevicesList();
    };
    fetchDevicesList = async () => {
        const {onLoaded} = this.props;
        const devices = await Camera.devicesList();
        this.setState({
            devicesList: devices,
            disabled: false
        })
        if(onLoaded){
            onLoaded();
        }
    };
    onChangeHandler = (event) => {
        this.setState({
            deviceId: event.target.value
        })
    };
    render() {
        const {devicesList, deviceId, disabled} = this.state;
        const items = devicesList.map((d, i) =>
            <MenuItem key={i} value={d.id}>{d.label}</MenuItem>
        );
        return (
            <Select label="Select the camera" value={deviceId} onChange={this.onChangeHandler} style={{minWidth: 280}} disabled={disabled} >
                {items}
            </Select>
        );
    }
}

DevicePicker.propTypes = {
    onLoaded: PropTypes.func
};
export default DevicePicker;
