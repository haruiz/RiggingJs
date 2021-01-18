import actionsTypes from "../action_types/appActionTypes"

let initialState = {
    faceLocation : null
};
export default function reducer(state=initialState, action){
    switch (action.type) {
        case actionsTypes.UPDATE_FACE_LOCATION:
            return {
                ...state,
                faceLocation: action.payload
            };
        default:
            return state;
    }
}

