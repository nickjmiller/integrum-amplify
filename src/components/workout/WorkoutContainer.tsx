/* eslint-disable no-await-in-loop */
import React from "react";
import {
    Box, Button, Flex, Text,
} from "rebass";
import { Slider, Label } from "@rebass/forms";
import Timer, { TimerControls } from "react-compound-timer";
import ExerciseInfo from "./ExerciseInfo";
// eslint-disable-next-line
import { Exercise } from "../../data/exercises";

let UIfx: any;

// document is not defined during react-static compilation
if (typeof document !== "undefined") {
    // eslint-disable-next-line global-require
    UIfx = require("uifx").default;
}

type WorkoutContainerProps = {
    workout: Exercise[]
}

type WorkoutContainerState = {
    currentActivity: "set" | "rest" | "none" | "countdown" | "complete";
    currentIndex: number;
    currentTimer: number;
    currentSets: number;
    defaultSets: number;
    defaultSetTime: number;
    defaultRestTime: number;
}

export default class WorkoutContainer extends
    React.Component<WorkoutContainerProps, WorkoutContainerState> {
    private countdown = UIfx ? new UIfx(`${window.location.origin}/sounds/countdown.mp3`) : undefined;

    private start = UIfx ? new UIfx(`${window.location.origin}/sounds/start.mp3`) : undefined;

    private timerDone = UIfx ? new UIfx(`${window.location.origin}/sounds/timerDone.mp3`) : undefined;


    private activityTextMap: any = {
        countdown: {
            text: <>Ready in: <Timer.Seconds /> seconds</>,
            color: "green",
        },
        set: {
            text: <>Time Remaining: <Timer.Seconds /> seconds</>,
        },
        rest: {
            text: <>Resting: <Timer.Seconds /> seconds</>,
        },
        none: {
            text: "",
            color: "black",
        },
        complete: {
            text: "Workout Complete!",
        },
    }

    constructor(props: WorkoutContainerProps) {
        super(props);
        this.state = {
            currentActivity: "none",
            currentIndex: 0,
            currentTimer: 0,
            defaultSets: 3,
            defaultSetTime: 40,
            defaultRestTime: 60,
            currentSets: 3,
        };
    }

    pause = (resume: TimerControls["resume"], pause: TimerControls["pause"], getTimerState: TimerControls["getTimerState"]) => () => {
        const state = getTimerState();
        if (state === "PLAYING") {
            pause();
        } else {
            resume();
        }
    }

    handleSetComplete = (currentSets: number, currentExercise: Exercise, defaultRestTime: number, setTime: TimerControls["setTime"]) => {
        if (currentSets === 1) {
            this.getNextExercise();
            return;
        }
        this.setState({
            currentSets: currentSets - 1,
        });
        if (currentExercise.alternate && !(currentSets % 2)) {
            this.startCountdown(setTime);
        } else {
            this.timerDone.play();
            setTime(defaultRestTime * 1000 + 10);
            this.setState({
                currentActivity: "rest",
            });
        }
    }

    setActivity = (start: TimerControls["start"], setTime: TimerControls["setTime"]) => () => {
        const {
            currentActivity, currentIndex, currentSets, defaultSets, defaultRestTime,
        } = this.state;
        const {
            workout,
        } = this.props;
        if (currentActivity === "countdown") {
            this.startSet(setTime);
        } else if (currentActivity === "set") {
            this.handleSetComplete(currentSets, workout[currentIndex], defaultRestTime, setTime);
        } else if (currentActivity === "rest") {
            this.startCountdown(setTime);
        } else if (currentActivity === "none") {
            this.startExercise(defaultSets, workout[currentIndex], setTime);
        }
        start();
    }

    setCheckpointsForActivity = (start: TimerControls["start"], setTime: TimerControls["setTime"], setCheckpoionts: TimerControls["setCheckpoints"]) => {
        setCheckpoionts([
            {
                time: 4000,
                callback: () => this.countdown.play(),
            },
            {
                time: 3000,
                callback: () => this.countdown.play(),
            },
            {
                time: 2000,
                callback: () => this.countdown.play(),
            },
            {
                time: 1000,
                callback: () => this.countdown.play(),
            },
            {
                time: 0,
                callback: this.setActivity(start, setTime),
            },
        ]);
    }

    setDefaultSets = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            defaultSets: parseInt(event.target.value, 10),
        });
    }

    setDefaultTimer = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            defaultSetTime: parseInt(event.target.value, 10),
        });
    }

    setDefaultRest = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            defaultRestTime: parseInt(event.target.value, 10),
        });
    }

    startCountdown = (setTime: TimerControls["setTime"]) => {
        this.setState({
            currentActivity: "countdown",
        });
        this.countdown.play();
        setTime(3100);
    }

    startSet = (setTime: TimerControls["setTime"]) => {
        const { defaultSetTime } = this.state;
        this.start.play();
        this.setState({
            currentActivity: "set",
        });
        setTime(defaultSetTime * 1000 + 10);
    }

    startExercise = (defaultSets: number, currentExercise: Exercise, setTime: TimerControls["setTime"]) => {
        let sets = defaultSets;
        if (sets % 2 && currentExercise.alternate) {
            sets++;
        }
        this.setState({
            currentSets: sets,
        });
        this.startCountdown(setTime);
    }

    getNextExercise = () => {
        const { currentIndex, defaultSets } = this.state;
        const { workout } = this.props;
        if (currentIndex < workout.length - 1) {
            this.setState({
                currentActivity: "none",
                currentIndex: currentIndex + 1,
                currentSets: defaultSets,
            });
        } else {
            this.setState({
                currentActivity: "complete",
                currentSets: 0,
            });
        }
    }

    render(): JSX.Element {
        const {
            currentActivity,
            currentIndex,
            currentSets,
            currentTimer,
            defaultSets,
            defaultSetTime,
            defaultRestTime,
        } = this.state;
        const { workout } = this.props;
        return (
            <Box px="5vw">
                <ExerciseInfo exercise={workout[currentIndex]} />
                <Flex justifyContent="space-between">
                    <Box width={2 / 5}>
                        <Text fontWeight="bold">{!(currentActivity === "none") ? `Sets Remaining: ${currentSets}` : ""}&nbsp;</Text>
                        <Label>
                            Default Sets (applies next exercise):
                            {` ${defaultSets}`}
                        </Label>
                        <Slider
                            name="Set Length"
                            defaultValue={defaultSets}
                            onChange={this.setDefaultSets}
                            min="1"
                            max="12"
                        />
                        <Label>
                            Default Set Time:
                            {` ${defaultSetTime}s`}
                        </Label>
                        <Slider
                            name="Set Length"
                            defaultValue={defaultSetTime}
                            onChange={this.setDefaultTimer}
                            min="5"
                            max="120"
                        />
                        <Label>
                            Default Rest:
                            {` ${defaultRestTime}s`}
                        </Label>
                        <Slider
                            name="Rest Length"
                            defaultValue={defaultRestTime}
                            onChange={this.setDefaultRest}
                            min="5"
                            max="120"
                        />
                    </Box>
                    <Flex
                        width={2 / 5}
                        flexDirection="column"
                    >
                        <Timer
                            initialTime={currentTimer + 10}
                            direction="backward"
                            startImmediately={false}
                        >
                            {({
                                pause, resume, start, setTime, setCheckpoints, getTimerState,
                            }: TimerControls) => {
                                this.setCheckpointsForActivity(start, setTime, setCheckpoints);
                                return (
                                    <>
                                        <Text color={this.activityTextMap[currentActivity].color} fontWeight="bold">
                                            {this.activityTextMap[currentActivity].text}&nbsp;
                                        </Text>
                                        <Button disabled={currentActivity !== "none"} variant="primary" onClick={this.setActivity(start, setTime)}>Go!</Button>
                                        <Button disabled={currentActivity === "complete"} variant="outline" onClick={() => setTime(10)}>Skip</Button>
                                        <Button disabled={currentActivity === "complete"} variant="outline" onClick={this.pause(resume, pause, getTimerState)}>
                                            {getTimerState() === "PAUSED" ? "Resume" : "Pause"}
                                        </Button>
                                    </>
                                );
                            }}
                        </Timer>
                    </Flex>
                </Flex>
            </Box>
        );
    }
}
