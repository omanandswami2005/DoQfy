import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Button, CircularProgress, FormControlLabel, Radio, RadioGroup, Snackbar, Modal, Box, LinearProgress, Divider } from '@mui/material';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@mui/material';

const McqComponent = () => {
    const [mcqs, setMcqs] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [questionResults, setQuestionResults] = useState({}); // Object to store result count for each question
    const [warningCount, setWarningCount] = useState(0); // Track warning count
    const [showWarning, setShowWarning] = useState(false); // Flag to show warning

    const [timer, setTimer] = useState(120); // Timer in seconds
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [reviewedQuestions, setReviewedQuestions] = useState([]); // Array to store indices of reviewed questions
    const [attendedQuestions, setAttendedQuestions] = useState([]); // Array to store indices of attended questions
    const [warning, setWarnign] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false); // State to control the result modal
    const [isFullScreen, setIsFullScreen] = useState(true);
    const { topic, count } = useParams();
    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => {
        fetchandstart();
        setIsFullScreen(false);

        document.onkeydown = function (e) {
            return false;
        }

        // Add event listener for fullscreenchange event
        //adding visibility API
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                    setShowWarning(true); // Show warning
                
            }

        });
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        // Cleanup function
        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);

        };


    }, [])

    const handleCloseWarning = () => {
        // Increment the warning count
        setWarningCount(prevCount => prevCount + 1);
    
        // Check if the warning count exceeds 3
        if (warningCount < 2) {
            // If not, hide the warning modal
            setShowWarning(false);
        } else {
            // If yes, redirect to the MCQ topics page
            setIsFullScreen(true)
            setShowWarning(false);
            
            setShowResultModal(true);
                        // window.location.replace("/mcq-topics");
        }
    };
    
    const handleFullScreenChange = () => {
        // Check if the document is in full-screen mode
        const isInFullScreen = document.fullscreenElement !== null;

        if (!isInFullScreen) {
            // Document exited full-screen mode, handle it here
            // Show a confirmation message or take necessary actions
            console.log('Document exited full-screen mode');
            setIsFullScreen(false);

            // Example: Show a warning message using a modal or an alert
            // setIsFullScreenWarningOpen(true);
            // alert('Document exited full-screen mode');
            // window.location.replace("/mcq-topics");
            // setWarnign(true);
        }
    };

    const fetchandstart = () => {

        fetchMcqs();
        toggleFullScreen();
    }

    const startTimer = () => {
        // Start timer interval
        const interval = setInterval(() => {
            setTimer(prevTimer => {
                if (prevTimer <= 0) {
                    clearInterval(interval); // End timer when it reaches 0
                    showResult();
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);
        // Save interval ID to state for later reference
        setIntervalId(interval);
    };
    
    const pauseTimer = () => {
        clearInterval(intervalId); // Clear the interval to pause the timer
    };
    
    const resumeTimer = () => {
        startTimer(); // Resume timer by starting a new interval
    };
    
    const stopTimer = () => {
        clearInterval(intervalId); // Clear the interval to stop the timer
        setTimer(0); // Reset timer to 0
    };
    

    // Function to handle marking a question as reviewed
    const handleReviewClick = () => {
        if (!reviewedQuestions.includes(currentQuestionIndex)) {
            setReviewedQuestions(prevReviewed => [...prevReviewed, currentQuestionIndex]);
        } else {
            setReviewedQuestions(prevReviewed => prevReviewed.filter(qIndex => qIndex !== currentQuestionIndex));
        }
    };
    // Function to handle marking a question as attended
    const handleAttendClick = () => {
        if (!attendedQuestions.includes(currentQuestionIndex)) {
            setAttendedQuestions(prevAttended => [...prevAttended, currentQuestionIndex]);
        }

    };

    // Function to remove a question from the "attended" list
    const handleRemoveFromAttend = (index) => {
        setAttendedQuestions(prevAttended => prevAttended.filter(qIndex => qIndex !== index));
        // Reset selected options for the current question
        setSelectedOptions(prevSelectedOptions => {
            const updatedSelectedOptions = [...prevSelectedOptions];
            updatedSelectedOptions[currentQuestionIndex] = '';
            return updatedSelectedOptions;
        });
    };


    // const toggleFullScreen = () => {
    //     if (!document.fullscreenElement) {
    //         document.documentElement.requestFullscreen();
    //     } else {
    //         if (document.exitFullscreen) {
    //             document.exitFullscreen();
    //         }
    //     }
    // }
    const fetchMcqs = async () => {
        try {
            const response = await fetch('http://localhost:5100/getmcqonline/' + topic + '/' + count);


            if (!response.ok) {
                throw new Error('Failed to fetch MCQs');
            }
            console.log('MCQs fetched successfully');
            const data = await response.json();
            console.log(data);
            // Shuffle questions and their options
            const shuffledMcqs = shuffleQuestions(data);
            setMcqs(shuffledMcqs);
            // Initialize result counts for each question index
            const initialResultCounts = {};
            data.forEach((_, index) => {
                initialResultCounts[index] = 0;
            });
            setQuestionResults(initialResultCounts);
            // setWarnign(false);
        } catch (error) {
            console.error('Error fetching MCQs:', error);
        }
    };
    const handleOptionChange = (event) => {
        const newSelectedOptions = [...selectedOptions];
        newSelectedOptions[currentQuestionIndex] = event.target.value;
        setSelectedOptions(newSelectedOptions);
        updateQuestionResults(currentQuestionIndex, event.target.value);
    };
    // Shuffle questions and their options
    const shuffleQuestions = (questions) => {
        return questions.map(question => ({
            ...question,
            options: shuffleArray(question.options) // Shuffle options of each question
        })).sort(() => Math.random() - 0.5); // Shuffle questions
    };

    // Shuffle array using Fisher-Yates algorithm
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };
    const updateQuestionResults = (index, selectedOption) => {
        const currentQuestion = mcqs[index];
        const correctOption = currentQuestion.options.find(option => option.isCorrect)?.text;
        const newQuestionResults = { ...questionResults };

        if (selectedOption === correctOption) {
            // Increment result count for the current question
            newQuestionResults[index] += 1;
        } else {
            // Decrement result count for the current question
            if (newQuestionResults[index] > 0) {
                newQuestionResults[index] -= 1;
            }
        }

        setQuestionResults(newQuestionResults);
    };

    const handleNextClick = () => {
        if (currentQuestionIndex < mcqs.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
    };

    const handlePreviousClick = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prevIndex => prevIndex - 1);
        }
    };


    const showResult = () => {
        setShowResultModal(true);
    };
    const handleCloseResultModal = () => {
        setShowResultModal(false);
    };
    const toggleFullScreen = () => {
        const body = document.body;
        const root = document.documentElement;

        if (!document.fullscreenElement) {
            // Prevent text selection in full-screen mode
            body.style.userSelect = 'none';
            // Add event listener to prevent exiting full-screen mode with Escape key
            document.addEventListener('contextmenu', handleContextMenu);
            root.requestFullscreen();
            setIsFullScreen(true);
        }
        setIsFullScreen(true);

    };



    const handleContextMenu = (event) => {
        // Prevent switching tabs when in full-screen mode

        event.preventDefault();
        event.stopPropagation();

    }



    const handleCloseSnackbar = () => {
        setIsSnackbarOpen(false);
    };
    const renderTimerText = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleCloseConfirmation = () => {
        setIsConfirmationOpen(false);
    };

    const handleFinishConfirm = () => {
        setIsConfirmationOpen(false);
        setTimer(0); // End the timer
        setMcqs([]); // Remove all MCQs
        showResult();
    };
    // Calculate total correct answers
    const totalCorrectAnswers = Object.values(questionResults).reduce((acc, curr) => acc + curr, 0);


    // Function to determine the color of the circle based on question status
    const getCircleColor = (index) => {
        if (reviewedQuestions.includes(index)) {
            // Question to be reviewed later
            return 'blue';
        } else if (attendedQuestions.includes(index)) {
            // Question already attended
            return 'purple';
        } else if (index < currentQuestionIndex) {
            // Question has been answered
            return 'gray';
        } else if (index === currentQuestionIndex) {
            // Current question
            return 'black';
        } else {
            // Question has not been answered yet
            return 'grey';
        }
    };
    // Function to handle jumping to a specific question
    const handleJumpToQuestion = (index) => {
        setCurrentQuestionIndex(index);
    };
    const handleCloseModal = () => {
        // Redirect user to MCQ topics page
        window.location.replace("/mcq-topics");
    };

    return (

        <Container maxWidth="md" style={{ display: 'flex', flexDirection: 'row', justifyContent: "space-around", alignItems: "center", maxWidth: "100vw", height: "99vh", padding: "0px", margin: "0px" }}>
            {/* Left Side (Navigation) */}

            {warning ? <><Snackbar open={true} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success">
                    Warning !!! Your are not in full-screen mode. or You Just Reloaded the page.

                </Alert>
            </Snackbar> <Link to="/mcq-topics"><Button variant="contained" color="success" style={{ position: "fixed", top: "10px", right: "10px" }}>Home</Button></Link></> : (<> <div style={{ display: 'flex', flexDirection: 'column', width: "25vw", height: "100vh", overflow: "auto", padding: "10px", borderRadius: "10px", justifyContent: "space-around" }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="h4" style={{ fontWeight: 'bold', fontFamily: "serif", marginBottom: "10px" }}>Navigation</Typography>
                </div>
                <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '0rem', flexWrap: "wrap", justifyContent: "space-around" }}>

                    {mcqs.map((_, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <button
                                style={{
                                    border: 'none',
                                    marginBlockEnd: '15px',
                                    backgroundColor: 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '40px', // Set width and height of the button to create a circular shape
                                    height: '40px',
                                    borderRadius: '50%',
                                    marginRight: '10px',
                                    padding: '4px', // Add padding to create space inside the circle
                                    background: getCircleColor(index),
                                    transition: 'transform 0.3s ease',
                                    transform: currentQuestionIndex === index ? 'scale(1.2)' : 'scale(1)', // Scale up if the current index matches the current question index
                                }}
                                onClick={() => handleJumpToQuestion(index)} // Jump to question when clicked
                            >
                                <Typography style={{ color: '#fff' }}>{index + 1}</Typography>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

                <Divider orientation="vertical" flexItem style={{ height: "99vh", width: "5px", backgroundColor: "black", marginInlineEnd: "2rem" }} />
                {/* Right Side (Question and Options) */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    <Paper elevation={3} style={{ padding: '50px', marginBottom: '20px', position: 'relative', overflow: 'auto' }}>
                        <Typography variant="h6" align="center" gutterBottom>{renderTimerText()}</Typography>
                        <LinearProgress variant="determinate" size="large" value={(timer / 60 * 100)} sx={{
                            width: '100%',
                            marginBottom: '10px',

                            transform: 'rotateY(180deg)', // Flip the progress bar horizontally


                        }} />

                        <Typography variant="h5" align="center" gutterBottom sx={{ marginBottom: '20px', overflow: 'auto', width: '33rem', maxHeight: '7rem', border: '1px solid black', }}>{mcqs[currentQuestionIndex]?.question}</Typography>
                        <RadioGroup value={selectedOptions[currentQuestionIndex] || ''} onChange={(event) => { handleOptionChange(event); handleAttendClick(); }}>
                            {mcqs[currentQuestionIndex]?.options.map((option, index) => (
                                <FormControlLabel key={index} sx={{ color: getCircleColor(currentQuestionIndex), border: '1px solid black', margin: '5px', borderRadius: '5px' }} value={option.text} control={<Radio sx={{ color: getCircleColor(currentQuestionIndex) }} size="small" />} label={option.text} />
                            ))}
                        </RadioGroup>
                        <Button
                            variant="contained"
                            size='small'
                            disabled={!attendedQuestions.includes(currentQuestionIndex)}
                            onClick={() => (handleRemoveFromAttend(currentQuestionIndex))}
                            sx={{
                                position: 'absolute',
                                top: '0px',
                                right: '-5px',
                                background: getCircleColor(currentQuestionIndex),
                                margin: '20px'
                            }}
                        >
                            Clear Selection
                        </Button>

                        <Button
                            variant="contained"
                            sx={{
                                position: 'absolute',
                                bottom: '-10px',
                                right: '-5px',
                                background: getCircleColor(currentQuestionIndex),
                                margin: '20px'
                            }}
                            size='small'
                            onClick={handleReviewClick}
                        >
                            {reviewedQuestions.includes(currentQuestionIndex) ? 'Remove from Review' : 'Review Later'}
                        </Button>
                    </Paper>


                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Button variant="contained" onClick={handlePreviousClick} disabled={currentQuestionIndex === 0}>&larr; Previous </Button>
                        {currentQuestionIndex !== mcqs.length - 1 ? (
                            <Button variant="contained" size="large" onClick={handleNextClick}>Next - {currentQuestionIndex + 1}/{mcqs.length}</Button>
                        ) : (
                            <Button variant="contained" size="large" color='secondary' onClick={() => { setIsConfirmationOpen(true) }}>Finish - {currentQuestionIndex + 1}/{mcqs.length}</Button>
                        )}
                    </div>


                    <Snackbar open={true} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                        <Alert onClose={handleCloseSnackbar} severity="success">
                            Total correct answers: {totalCorrectAnswers}
                        </Alert>
                    </Snackbar>
                </div>

                {/* Confirmation Modal */}
                <Modal open={isConfirmationOpen} onClose={handleCloseConfirmation}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'black', padding: '20px', borderRadius: '8px' }}>
                        <Typography variant="h5" align="center">Are you sure you want to finish?</Typography>
                        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                            <Button variant="contained" onClick={handleFinishConfirm}>Yes</Button>
                            <Button variant="contained" onClick={handleCloseConfirmation}>No</Button>
                        </div>
                    </div>
                </Modal>
                {/* Result Modal */}
                <Modal open={showResultModal}  >
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'black', padding: '20px', borderRadius: '8px' }}>
                        <Typography variant="h5" align="center" gutterBottom>Total correct answers: {totalCorrectAnswers}</Typography>
                        <Typography variant="h6" align="center" gutterBottom>Congratulations!</Typography>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <Button variant="contained" onClick={() =>{ window.location.replace("/mcq-topics")}}>Go Back</Button>
                        </div>
                    </div>
                </Modal>
                <Modal open={!isFullScreen} disableEscapeKeyDown={true} disablebackdropclick={true}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'black', padding: '20px', borderRadius: '8px' }}>
                        <Typography variant="h5" align="center" gutterBottom>Fullscreen Mode</Typography>
                        <Typography variant="body1" align="center" gutterBottom>Please Do Not Get Exit Full Screen Mode</Typography>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <Button variant="contained" onClick={()=>{toggleFullScreen();            startTimer();
}}>Ok </Button>
                        </div>
                    </div>
                </Modal>

                {/* Warning Modal */}
            <Modal open={showWarning} onClose={handleCloseWarning}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'black', padding: '20px', borderRadius: '8px' }}>
                    <Typography variant="h5" align="center">Warning</Typography>
                    <Typography variant="body1" align="center">You are leaving the MCQ test for {warningCount +1}/3. Are you sure?</Typography>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                        <Button variant="contained" onClick={handleCloseWarning}>Cancel</Button>
                        <Button variant="contained" onClick={handleCloseModal}>Leave</Button>
                    </div>
                </Box>
            </Modal>
                {/* Buttons for marking question as reviewed and attended */}
                <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>

                    <Button variant="contained" onClick={toggleFullScreen}>Start</Button>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>

                            <CircularProgress variant="determinate" value={timer / 60 * 100} size={100} thickness={4} sx={{ color: getCircleColor(currentQuestionIndex) }} />
                            <Box
                                sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography variant="h6" align="center" gutterBottom>{renderTimerText()}</Typography>
                            </Box>
                        </Box>
                    </div>
                </div></>)}
        </Container>
    );
};

export default McqComponent;
