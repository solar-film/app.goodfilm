import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainApp from './MainApp';

const BostikPage = lazy(() => import('./BostikPage'));
const AdminPanel = lazy(() => import('./AdminPanel'));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route
          path="/admin"
          element={(
            <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Sarabun, sans-serif' }}>กำลังเปิดระบบผู้ดูแล...</div>}>
              <AdminPanel />
            </Suspense>
          )}
        />
        <Route
          path="/bostik-presentation"
          element={(
            <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Sarabun, sans-serif' }}>กำลังเปิด BOSTIK Presentation...</div>}>
              <BostikPage />
            </Suspense>
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;
