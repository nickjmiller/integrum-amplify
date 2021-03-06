import React, { useState } from "react";
import { useRouteData } from "react-static";
import { Link } from "@reach/router";
import { Button, Text, Flex } from "rebass";
import { Exercise } from "src/data/exercises";
import WorkoutContainer from "components/workout/WorkoutContainer";
import ExerciseInfo from "components/workout/ExerciseInfo";
import { useDispatch } from "react-redux";
import { setSingleExercise } from "features/workout/workoutSlice";
import { MUSCLE_MAP, WORKOUT_MAP } from "../data/MuscleMap";

export default () => {
    const dispatch = useDispatch();
    const { exercise }: { exercise: Exercise } = useRouteData();
    const [workout, setWorkout] = useState(false);
    return (
        <Flex flexDirection="column">
            <Link to="/exercises/">
                <Button variant="primary" marginBottom="1em">Go Back</Button>
            </Link>
            {!workout ? (
                <Button
                    margin="auto"
                    variant="secondary"
                    onClick={() => {
                        setWorkout(true);
                        dispatch(setSingleExercise(exercise));
                    }}
                >Start Workout
                </Button>
            ) : null}
            {workout
                ? <WorkoutContainer /> : <ExerciseInfo exercise={exercise} />}
            <Text>
                Muscles: {exercise.muscles.join(", ")}
            </Text>
            <Text>
                Muscle Groups: {[...new Set(exercise.muscles.map((muscle) => WORKOUT_MAP[MUSCLE_MAP[muscle]]))].join(", ")}
            </Text>
            {exercise.equipment.length
                ? (
                    <Text>
                        Equipment: {exercise.equipment.join(", ")}
                    </Text>
                ) : null}

        </Flex>
    );
};
