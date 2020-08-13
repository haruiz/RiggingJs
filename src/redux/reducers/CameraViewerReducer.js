import actionsTypes from "../action_types/CameraViewerActionTypes"

var initialState = {
    facemesh_keypoints : null,
    posenet_keypoints : null,
    head_rotation: null
};
export default function reducer(state=initialState, action){
    switch (action.type) {
        case actionsTypes.UPDATE_FACEMESH_KEYPOINTS:
            return {
                ...state,
                facemesh_keypoints: action.payload
            };
        case actionsTypes.UPDATE_POSENET_KEYPOINTS:
            return {
                ...state,
                posenet_keypoints: action.payload
            };
        case actionsTypes.UPDATE_HEAD_ROTATION:
            return {
                ...state,
                head_rotation: action.payload
            };
        case actionsTypes.UPDATE_BODY_ROTATION:
            return {
                ...state,
                body_rotation: action.payload
            };
        default:
            return state;
    }
}
