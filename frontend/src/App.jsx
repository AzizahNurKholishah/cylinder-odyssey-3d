import { Suspense, lazy, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppShell, { ProtectedRoute } from './components/layout/AppShell.jsx'
import { Spinner } from './components/ui/index.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const AdventureMap = lazy(() => import('./pages/AdventureMap.jsx'))
const Lesson = lazy(() => import('./pages/Lesson.jsx'))
const Lab = lazy(() => import('./pages/Lab.jsx'))
const Training = lazy(() => import('./pages/Training.jsx'))
const TrainingQuestion = lazy(() => import('./pages/TrainingQuestion.jsx'))
const Playground = lazy(() => import('./pages/Playground.jsx'))
const GamePage = lazy(() => import('./pages/games/GamePage.jsx'))
const FinalChallenge = lazy(() => import('./pages/FinalChallenge.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/map" element={<AdventureMap />} />
              <Route path="/lesson/:slug" element={<Lesson />} />
              <Route path="/lab" element={<Lab />} />
              <Route path="/training" element={<Training />} />
              <Route path="/training/:id" element={<TrainingQuestion />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/playground/:slug" element={<GamePage />} />
              <Route path="/final" element={<FinalChallenge />} />
              <Route path="/profile" element={<Profile />} />
              <Route element={<ProtectedRoute teacher />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Route>
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}
