import actionTypes from "../action_types/CameraViewerActionTypes"

export function update_facemesh_keypoints(points) {
    return {
        type: actionTypes.UPDATE_FACEMESH_KEYPOINTS,
        payload: points
    }
}


