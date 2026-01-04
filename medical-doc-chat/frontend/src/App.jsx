import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DocumentList from './pages/DocumentList';
import DocumentChat from './pages/DocumentChat';
import AdminLogin from './pages/AdminLogin';
import AdminUpload from './pages/AdminUpload';
import SafetyState from './pages/SafetyState';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DocumentList />} />
        <Route path="/chat/:docId" element={<DocumentChat />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/upload" element={<AdminUpload />} />
        <Route path="/safety" element={<SafetyState />} />
      </Routes>
    </BrowserRouter>
  );
}