import { createSlice} from '@reduxjs/toolkit';

const movieSlice = createSlice({
    name: 'movie',
    initialState: {
        data: [],
        movieDetails: {},
        loading: false,
        error: null,
    },
    reducers: {
        fetchMoviesStart(state) {
            state.loading = true;
            state.error = '';
        },
        fetchMoviesSuccess(state, action) {
            state.loading = false;
            state.data = action.payload;
        },
        fetchMoviesFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        }
    }

})
export const { fetchMoviesSuccess, fetchMoviesStart, fetchMoviesFailure } =
  movieSlice.actions;

export default movieSlice.reducer;
