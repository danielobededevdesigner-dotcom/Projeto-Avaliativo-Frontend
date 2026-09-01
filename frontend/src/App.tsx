import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom'

import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'

import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/cadastro"
            element={<RegisterPage />}
          />

          <Route
            path="/recuperar-senha"
            element={
              <ForgotPasswordPage />
            }
          />

          <Route
            path="/redefinir-senha"
            element={
              <ResetPasswordPage />
            }
          />
        </Route>

        <Route
          element={<ProtectedRoute />}
        >
          <Route
            path="/"
            element={<HomePage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App