import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    display: 'flex',
    padding: 30,
    backgroundColor: '#eee',
    borderWidth: 2, // Add border
    borderStyle: 'solid',
    borderRadius: 35,
    borderColor: '#000000', // Border color
  },
  section: {
    marginBottom: 10,
  },
  question: {
    fontSize:11,
    marginBottom: 5,
  },
  option: {
    fontSize:11,
    marginLeft: 20,
    marginBottom: 6,
  },
  correctAnswer: {
    fontSize:11,
    marginBottom: 10,
    color: 'red',
    border: '1 solid green',
    padding: 5,
  },
  topicTitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 10,
    marginTop: 5,
  }
});

const shuffleArray = (array) => {
  const shuffledArray = [...array]; // Create a copy of the original array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
  }
  return shuffledArray;
};

// Component to generate PDF document
const PDFDocument = React.memo(({ mcqs1, topicTitle }) => {
  if (!mcqs1 || mcqs1.mcqs.length === 0 ) return null;
  
  const mcqs = mcqs1.mcqs;

  const renderPages = () => {
    const pages = [];
    const maxMcqsPerPage = 5;

    for (let i = 0; i < mcqs.length; i += maxMcqsPerPage) {
      const mcqsPerPage = mcqs.slice(i, i + maxMcqsPerPage);

      pages.push(
        <Page size="A4" style={styles.page} key={`page-${i}`} >
          <Text style={styles.topicTitle}>{topicTitle.topicTitle.toUpperCase()}</Text>
          <View style={styles.separator} />

          {mcqsPerPage.map((mcq, index) => {
            const shuffledOptions = shuffleArray(mcq.options); // Shuffle options
            return (
              <View key={index} style={styles.section}>
                <Text style={styles.question}>{`Q ${i + index + 1}: ${mcq.question}`}</Text>
                {shuffledOptions.map((option, optionIndex) => (
                  <Text key={optionIndex} style={styles.option}>{`${String.fromCharCode(97 + optionIndex)}. ${option.text}`}</Text>
                ))}
                <Text style={styles.correctAnswer}>
                  {`Correct Answer: ${String.fromCharCode(97 + shuffledOptions.findIndex(option => option.isCorrect))}. ${shuffledOptions.find(option => option.isCorrect).text}`}
                </Text>
              </View>
            );
          })}
        </Page>
      );
    }

    return pages;
  };

  return (
    <PDFViewer style={{ border: '1px solid white', width: '40%', height: '99vh' }}>
      <Document>
        {renderPages()}
      </Document>
    </PDFViewer>
  );
});

export default PDFDocument;
