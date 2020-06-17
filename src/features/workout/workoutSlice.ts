/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkoutGroup, WORKOUT_MAP, MUSCLE_MAP } from "../../data/MuscleMap";
// eslint-disable-next-line import/named
import EXERCISES, { Exercise } from "../../data/exercises";

const shuffleExercises = (workoutPlan: WorkoutGroup[]) => {
    const array = [...EXERCISES];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    const workout: Exercise[] = [];

    while (workoutPlan.length) {
        const exerciseIndex = array.findIndex(
            (e) => e.muscles.map((m) => WORKOUT_MAP[MUSCLE_MAP[m]]).includes(workoutPlan[0]),
        );
        workout.push(array[exerciseIndex]);
        array.splice(exerciseIndex, 1);
        workoutPlan.shift();
    }

    return workout;
};

const DEFAULT_WORKOUT_PLAN: WorkoutGroup[] = ["Lower", "Upper", "Lower", "Upper", "Core"];

const INITIAL_WORKOUT = shuffleExercises([...DEFAULT_WORKOUT_PLAN]);

type WorkoutState = {
    currentIndex: number;
    exercises: Exercise[];
}

const initialState: WorkoutState = {
    currentIndex: 0,
    exercises: INITIAL_WORKOUT,
};

const workoutSlice = createSlice({
    name: "workout",
    initialState,
    reducers: {
        setWorkout(state, action: PayloadAction<WorkoutGroup[]>) {
            state.exercises = shuffleExercises(action.payload);
            state.currentIndex = 0;
        },
        setSingleExercise(state, action: PayloadAction<Exercise>) {
            state.exercises = [action.payload];
            state.currentIndex = 0;
        },
        incrementIndex(state) {
            state.currentIndex += 1;
        },
        resetIndex(state) {
            state.currentIndex = 0;
        },
    },
});

export const {
    incrementIndex,
    resetIndex,
    setSingleExercise,
    setWorkout,
} = workoutSlice.actions;

export default workoutSlice.reducer;
