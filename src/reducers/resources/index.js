import { createSlice } from 'redux-starter-kit';

const resources = createSlice({
    slice: 'resources',
    initialState: { resource1: { name: 'resource1' } },
    reducers: {
        ADD_RESOURCE: (state, action) => { console.log(action); return state; },
    },
});

export default resources;
