import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import NavBar from './components/NavBar'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import ExpenseDashboard from './pages/ExpenseDashboard'
import SoilDashboard from './pages/SoilDashboard'
import PestDashboard from './pages/PestDashboard'
import KnowledgePage from './pages/Knowledge/KnowledgePage'
import './App.css'

function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          
          <Route path='/' element={<Dashboard/>} />
          <Route path='/dashboard' element={<Dashboard/>} />
          <Route path='/login' element={<Login/>} />
          <Route path='/register' element={<Register/>} />
          <Route path='/expenses' element={<ExpenseDashboard/>} />
          <Route path='/soil' element={<SoilDashboard/>} />
          <Route path='/pests' element={<PestDashboard/>} />
          <Route path='/knowledge' element={<KnowledgePage/>} />
      
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
