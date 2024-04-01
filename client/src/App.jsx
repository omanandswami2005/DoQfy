import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { useState } from "react";
import { PDFViewer, Document, Page, Text } from '@react-pdf/renderer';


const App = () => {
  const [selectedDocs, setSelectedDocs] = useState([]);


  const MyDoc = () => (
    <Document>
      <Page>
        <Text style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 40, opacity: 0.5 }}>Watermark Text</Text>
      </Page>
      <Page>
        <Text style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 40, opacity: 0.5 }}>Watermark Text</Text>
      </Page>
      <Page>
        <Text style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 40, opacity: 0.5 }}>Watermark Text</Text>
      </Page>
    </Document>
  );
  return (
    <>

      {selectedDocs.length ? <DocViewer
        documents={selectedDocs.map((file) => ({
          uri: window.URL.createObjectURL(file),
          fileName: file.name,
        }))}
        pluginRenderers={DocViewerRenderers}
        theme={{
          primary: "#5296d8",
          secondary: "#ffffff",
          tertiary: "#5296d899",
          textPrimary: "#ffffff",
          textSecondary: "#5296d8",
          textTertiary: "#00000099",
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
      /> : null}
      <input
        type="file"
        onChange={(el) =>
          el.target.files?.length &&
          setSelectedDocs(Array.from(el.target.files))
        }
      />
      {selectedDocs.length ? <PDFViewer style={{ border: '1px solid white', width: '40%', height: '99vh' }}>
        {<MyDoc />}
      </PDFViewer> : null}
    </>
  );
};

export default App;




// import React from 'react';
// import { PDFViewer, Document, Page, Text } from '@react-pdf/renderer';

// const MyDoc = () => (
//   <Document>
//     <Page>
//       <Text style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 40, opacity: 0.5 }}>Watermark Text</Text>
//     </Page>
//   </Document>
// );

// const App = () => (
//   <PDFViewer width="600" height="600" style={{ border: '1px solid white' }}>
//     <MyDoc />
//   </PDFViewer>
// );

// export default App;
