import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Typography, Grid, CircularProgress, Button,TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Assuming you are using React Router for navigation

const McqTopicsComponent = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMCQs, setSelectedMCQs] = useState({}); // State to hold the selected number of MCQs for each topic


    const nav = useNavigate();

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await fetch('http://localhost:5100/availabletopics');
                if (!response.ok) {
                    throw new Error('Failed to fetch topics');
                }
                const data = await response.json();
                setTopics(data);
                console.log(data)
                setLoading(false);
            } catch (error) {
                console.error('Error fetching topics:', error);
            }
        };

        fetchTopics();
    }, []);

    const handleTopicClick = (topicName) => {
        // Ensure that the selected number of MCQs is valid (less than or equal to the count)
        if(confirm("Are you sure you want to proceed? /n You will be redirected to the MCQ page with the selected topic and number of MCQs. Also The Full Screen Mode will be start.")){
            // Navigate to the MCQ component with the selected topic and number of MCQs
            nav(`/mcq/${topicName}/${selectedMCQs[topicName] || 3}`);
        }
        else{
            return;
        }
        
    };

    const handleMCQsChange = (topicName, value) => {
        // Get the maximum number of MCQs available for the topic
        const maxMCQs = topics.find(topic => topic.topic === topicName)?.count || 3;
    
        // Ensure that the value is within the range of 1 and the maximum number of MCQs available
        value = Math.max(3, Math.min(value, maxMCQs));
    
        setSelectedMCQs({
            ...selectedMCQs,
            [topicName]: value // Update the number of MCQs for the specified topic
        });
    };
    

    return (
        < div  style={{ margin: '2rem'  }}>

        <Typography variant="h4" align="center" sx={{ fontFamily: 'elephant', color: 'black', fontWeight: 'bold', fontSize: '40px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',marginBottom: '5rem',backdropFilter: 'blur(5px)',  }} >VPolyQuizer</Typography>

        <Grid container spacing={2}>
            
            {loading ? (
                <Grid item xs={12} align="center">
                    <CircularProgress />
                </Grid>
            ) : (
              topics.length > 0 ?( topics.map((topic, index) => (
                    <Grid item xs={12} sm={4} md={4} key={index} >
                        <Card>
                            <CardHeader title={topic.topic} />

                            <CardContent>
                            <Typography variant="body1">
                                        {topic.count} MCQs Available
                                    </Typography> <br />
                                    <TextField
                                        label="Number of MCQs"
                                        type="number"
                                        sx={{marginBottom: '20px'}}
                                        value={selectedMCQs[topic.topic] || 3}
                                        onChange={(e) => handleMCQsChange(topic.topic, parseInt(e.target.value))}

                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    /> <br />
                                <Button onClick={() => handleTopicClick(topic.topic)} variant="contained" sx={{ margin: 'auto' , width: '50%' ,display: 'block' }} color="primary">Start MCQ</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))):<h3>Sorry no topics available</h3>
            )}
        </Grid>
        </div>
    );
};

export default McqTopicsComponent;

