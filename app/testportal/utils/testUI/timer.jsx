let startTime = 0;
let endTime = 0;

// Function to start the timer
export function startTimer() {
    startTime = new Date().getTime();
}

// Function to stop the timer and calculate the time taken
export function stopTimer() {
    // endTime = new Date().getTime();
    // const timeTaken = endTime - startTime;

    // localStorage.timeTaken = timeTaken
    // return timeTaken;

    endTime = new Date().getTime();
    return endTime - startTime
}