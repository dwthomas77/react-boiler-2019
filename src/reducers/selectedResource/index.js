import { createSlice } from 'redux-starter-kit';

export const UPDATE_SELECTED_RESOURCE = 'UPDATE_SELECTED_RESOURCE';

const selectedResource = createSlice({
    slice: 'selectedResource',
    initialState: '',
    reducers: {
        [UPDATE_SELECTED_RESOURCE]: (state, action) => {
            return action.payload;
        },
    },
});

export default selectedResource;
