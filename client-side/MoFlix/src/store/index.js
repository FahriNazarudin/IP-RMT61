import { configureStore } from "@reduxjs/toolkit";  
import movieSlice from "./movie";

const store = configureStore({
    reducer: {
        movie: movieSlice,
    },
});

export default store;