import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DocumentList from './pages/DocumentList';
import DocumentChat from './pages/DocumentChat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DocumentList />} />
        <Route path="/chat/:docId" element={<DocumentChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;