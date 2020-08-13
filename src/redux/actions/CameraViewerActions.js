import actionTypes from "../action_types/CameraViewerActionTypes"

export function updateFacemeshKeypoints(points) {
    return {
        type: actionTypes.UPDATE_FACEMESH_KEYPOINTS,
        payload: points
    }
}

export function updatePosenetKeypoints(value) {
    return {
        type: actionTypes.UPDATE_POSENET_KEYPOINTS,
        payload: value
    }
}


export function updateHeadRotation(value) {
    return {
        type: actionTypes.UPDATE_HEAD_ROTATION,
        payload: value
    }
}

export function updateBodyRotation(value) {
    return {
        type: actionTypes.UPDATE_BODY_ROTATION,
        payload: value
    }
}
