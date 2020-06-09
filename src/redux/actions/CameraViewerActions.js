import actionTypes from "../action_types/CameraViewerActionTypes"

export function updateFacemeshKeypoints(points) {
    return {
        type: actionTypes.UPDATE_FACEMESH_KEYPOINTS,
        payload: points
    }
}

export function updateHeadRotation(value) {
    return {
        type: actionTypes.UPDATE_HEAD_ROTATION,
        payload: value
    }
}


