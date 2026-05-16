import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home } from './pages/Home/Home';
import { Room } from './pages/Room/Room';
import { Lecture } from './pages/Lecture/Lecture';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Rooms } from './pages/Rooms/Rooms';
import { Learning } from './pages/Learning/Learning';
import { CreateLecture } from './pages/CreateLecture/CreateLecture';
import { AuthModal } from './components/AuthModal/AuthModal';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useSelector((state) => state.auth);
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthModal />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
        <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
        <Route path="/learning/create" element={<ProtectedRoute><CreateLecture /></ProtectedRoute>} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/lecture/:lectureId" element={<Lecture />} />
      </Routes>
    </Router>
  );
}

export default App;
