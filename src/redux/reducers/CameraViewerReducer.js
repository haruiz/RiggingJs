import actionsTypes from "../action_types/CameraViewerActionTypes"

var initialState = {
    facemesh_keypoints : null
};
export default function reducer(state=initialState, action){
    switch (action.type) {
        case actionsTypes.UPDATE_FACEMESH_KEYPOINTS:
            return {
                ...state,
                facemesh_keypoints: action.payload
            };
        default:
            return state;
    }
}

