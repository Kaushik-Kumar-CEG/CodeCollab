import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home/Home';
import { Room } from './pages/Room/Room';
import { Lecture } from './pages/Lecture/Lecture';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Rooms } from './pages/Rooms/Rooms';
import { Learning } from './pages/Learning/Learning';
import { CreateLecture } from './pages/CreateLecture/CreateLecture';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/learning/create" element={<CreateLecture />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/lecture/:lectureId" element={<Lecture />} />
      </Routes>
    </Router>
  );
}

export default App;
