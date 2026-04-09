import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home/Home';
import { Room } from './pages/Room/Room';
import { Lecture } from './pages/Lecture/Lecture';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/lecture/:lectureId" element={<Lecture />} />
      </Routes>
    </Router>
  );
}

export default App;
