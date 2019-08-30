import { createSlice } from 'redux-starter-kit';

export const UPDATE_ALL_RESOURCES = 'UPDATE_ALL_RESOURCES';

const resources = createSlice({
    slice: 'resources',
    initialState: [{ name: 'resource1' }],
    reducers: {
        [UPDATE_ALL_RESOURCES]: (state, action) => {
            return action.payload;
        },
    },
});

export default resources;
