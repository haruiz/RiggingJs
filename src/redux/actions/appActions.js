import actionTypes from "../action_types/appActionTypes"

export function updateFaceLocation(face) {
    return {
        type: actionTypes.UPDATE_FACE_LOCATION,
        payload: face
    }
}
