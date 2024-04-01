import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Ok from './Work.jsx';
import McqComponent from './McqComponent.jsx';
import McqTopicsComponent from './McqTopicsComponent.jsx';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Routes >
            <Route path="/" element={<Ok />} />
            <Route path="/mcq/:topic/:count" element={<McqComponent />} />
            <Route path="/work" element={<Ok />} />
            <Route path="/mcq-topics" element={<McqTopicsComponent />} />
        </Routes>
    </BrowserRouter>
);
