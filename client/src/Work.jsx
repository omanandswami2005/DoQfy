import React, { useCallback, useState, useMemo } from 'react';
import { Link } from "react-router-dom";
import { createWorker } from 'tesseract.js';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import PDFDocument from './PDFDocument';


import { Button, Input, Snackbar, TextField ,LinearProgress,Alert} from '@mui/material';
// import pdfParse from 'pdf-parse'; // Import pdf-parse for parsing PDF files
// import mammoth from 'mammoth'; // Import mammoth for parsing DOCX files
import './App.css';

const ResultPDF = React.memo(({ textResult }) => {
  if (!textResult) return null;

  // Create styles
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      backgroundColor: '#fff',
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
  });

  const MyDocument = ({ textResult }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>{textResult}</Text>
        </View>
      </Page>

    </Document>

  )

  return (

    <PDFViewer style={{ border: '1px solid white', width: '40%', height: '99vh' }}>
      <MyDocument textResult={textResult} />
    </PDFViewer>
  );
});

const PdfViewer = React.memo(({ selectedFile }) => {
  if (!selectedFile) return null;

  const docu = [{
    uri: selectedFile && window.URL.createObjectURL(selectedFile),
    fileName: selectedFile && selectedFile.name,
  }];

  return (
    <DocViewer
      documents={docu}
      pluginRenderers={DocViewerRenderers}
      theme={{
        primary: '#5296d8',
        secondary: '#ffffff',
        tertiary: '#5296d899',
        textPrimary: '#ffffff',
        textSecondary: '#5296d8',
        textTertiary: '#00000099',
        disableThemeScrollbar: false,
      }}
      style={{
        width: '40%',
        height: '99vh',
        border: '2px solid #ccc',
        backgroundColor: '#f0f0f0',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
      }}
    />
  );
});

function Ok() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [textResult, setTextResult] = useState([]);
  const [fileType, setFileType] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [numMcqs, setNumMcqs] = useState(5);
  const [open , setOpen] = useState(false);

const handleClose = () => {
  setOpen(false);
}
  const worker = createWorker();
  const convertToText = useCallback(async () => {

    if (topic === "") {
      alert("Please select a topic");
      return;
    };
    if (!selectedFile) {
      alert("Please select a file");
      return;

    };
    setLoading(true); // Set loading state to true

    try {
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      let text = "";

      if (fileType === 'pdf') {
        // const data = await pdfParse(selectedFile);
        // text = data.text;
        const formData = new FormData();
        formData.append('pdfFile', selectedFile);
        formData.append("topic", topic);
        formData.append("numMcqs", numMcqs);


        try {
          const response = await fetch('http://localhost:5100/extract', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            alert("something went wrong")

            throw new Error('Failed to extract text from PDF');
          }
          const data = await response.json();
          console.log(data);
          setTextResult([data]);
          setOpen(true);
          // console.log(textResult);
        } catch (error) {
          alert("something went wrong")

          console.error('Error extracting text from PDF:', error);

        }
        console.log("pdf");



      } else if (fileType === 'docx') {
        console.log("doc")
        const formData = new FormData();
        formData.append('docxFile', selectedFile); // Append DOCX file
        formData.append("topic", topic);
        formData.append("numMcqs", numMcqs);


        try {
          const response = await fetch('http://localhost:5100/extract', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            alert("something went wrong")

            throw new Error('Failed to extract text from PDF');
          }
          const data = await response.json();
          console.log(data);
          setTextResult([data]);
          setOpen(true);

        } catch (error) {
          console.error('Error extracting text from DOCX:', error);
        }
      } else if (fileType === 'image') {
        const { data } = await worker.recognize(selectedFile);
        text = data.text;
        console.log(text);

        const formData = new FormData();
        formData.append('txt', text); // Append DOCX file
        formData.append("topic", topic);
        formData.append("numMcqs", numMcqs);

        try {
          const response = await fetch('http://localhost:5100/extract', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            alert("something went wrong")
            throw new Error('Failed to extract text from DOCX');
          }

          const data = await response.json();
          setTextResult([data]);
          setOpen(true);

        } catch (error) {
          console.error('Error extracting text from DOCX:', error);
        }
      } else if (fileType === 'text') {
        const formData = new FormData();
        formData.append('txtFile', selectedFile); // Append DOCX file
        formData.append("topic", topic);
        formData.append("numMcqs", numMcqs);

        try {
          const response = await fetch('http://localhost:5100/extract', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            alert("something went wrong")

            throw new Error('Failed to extract text from PDF');
          }
          const data = await response.json();
          console.log(data);
          setTextResult([data]);
          setOpen(true);

        } catch (error) {
          alert("something went wrong")
        }
      }

    } catch (error) {
      console.error('Error converting document:', error);
    } finally {
      setLoading(false); // Set loading state to false when done
    }
  }, [worker, selectedFile, fileType]);

  // useEffect(() => {
  //   convertToText();
  // }, [selectedFile, convertToText]);

  const handleStartExtraction = () => {
    // Start the text extraction process
    convertToText();
  };

  const handleChangeFile = useCallback((e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension === 'pdf') {
        setFileType('pdf');
      } else if (extension === 'docx') {
        setFileType('docx');
      } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
        setFileType('image');
      } else {
        setFileType('');
      }
      // Read the contents of the file for preview
      const reader = new FileReader();
      reader.readAsDataURL(file);
    }
  }, [setSelectedFile, setFileType]);

  const handleChangeNumMcqs = useCallback((e) => {

    if (e.target.value >= 5 && e.target.value <= 70) {
      setNumMcqs(e.target.value);
    } else {
      setNumMcqs(5);
    }

  }, [setNumMcqs]);
  const handleChangeTopic = useCallback((e) => {
    setTopic(e.target.value);
  }, [setTopic]);





  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: '100vw' }}>
      <PdfViewer selectedFile={selectedFile} />

      <div>
        <h1 style={{ textAlign: 'center' }}>DoQfy &rarr;</h1>
        <br /> <p style={{ textAlign: 'center' }}>Get MCQs from Image, PDF, Txt, or DOCX!</p>
        <div className="input-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Button variant="contained" color="secondary" component="label" sx={{ border: "1px solid black", color: "white" }}>Upload File
            <Input type="file" id="upload" onChange={handleChangeFile} /> </Button><br />
          <br />


          <TextField
            label="Enter Topic "
            type='text'
            placeholder='Enter topic'
            name='topic'
            id='topic'
            value={topic}
            color='secondary'
            onInput={handleChangeTopic}
            required


          /> <br />
          <TextField
            type='number' placeholder='Enter number of MCQs ' name='numMcqs' id='numMcqs' value={numMcqs} onInput={handleChangeNumMcqs} required
            color='secondary'
            label="Number of MCQs" />
          <br />


          <Button variant='contained' color='secondary' onClick={handleStartExtraction}>Start Extracting</Button>
          <br /><br />
          <Link variant="contained" to="/mcq-topics" ><Button variant='contained' color='primary'>Go to MCQ</Button></Link>
        </div>
      </div>

      {/* <ResultPDF textResult={textResult} /> */}

      <PDFDocument mcqs1={textResult[0]} topicTitle={textResult[0]} />



      {loading && (
  <div className="full-screen-wrapper" style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background
    display: 'flex', // Always display the wrapper
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999 // Ensure it appears on top of other elements
  }}>
    <div style={{ width: '80%', maxWidth: 400 }}>
      <LinearProgress color="secondary" />
      <p style={{ marginTop: '1rem', color: '#fff', textAlign: 'center',backgroundColor: '#222',fontFamily: 'Poppins' }}>Please Wait While We Are <b style={{ color: 'yellow', fontFamily: 'elephant',letterSpacing: '1px' }}> DoQfy-ing</b> Your Document !</p>
    </div>
  </div>
)}
<Snackbar open={open} autoHideDuration={10000} onClose={handleClose}  >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Document Extracted Successfully ! <br />Please Check The Right Section For MCQs
        </Alert>
      </Snackbar>

    </div>
  );
}

export default Ok;
