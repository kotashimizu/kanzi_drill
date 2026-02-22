import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import GradeSelectPage from './pages/GradeSelectPage.jsx';
import DrillPage from './pages/DrillPage.jsx';
import CapturePageWrapper from './pages/CapturePage.jsx';
import StudyPage from './pages/StudyPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import MistakeInputPage from './pages/MistakeInputPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import BottomNav from './components/BottomNav.jsx';

/**
 * アプリのルートコンポーネント
 * ページルーティングとナビゲーションバーを設定する
 */
function App() {
    const location = useLocation();
    const isLandingPage = location.pathname === '/lp';

    return (
        <div style={{ paddingBottom: isLandingPage ? 0 : '80px', minHeight: '100vh' }}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/lp" element={<LandingPage />} />
                <Route path="/grade" element={<GradeSelectPage />} />
                <Route path="/drill" element={<DrillPage />} />
                <Route path="/capture" element={<CapturePageWrapper />} />
                <Route path="/study" element={<StudyPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/mistakes" element={<MistakeInputPage />} />
            </Routes>
            {!isLandingPage && <BottomNav />}
        </div>
    );
}

export default App;
