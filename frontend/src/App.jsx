import { Routes, Route, Navigate } from "react-router-dom"

import Navbar from "@/components/ui/Navbar"

import Home from "@/pages/Home"
import Catalog from "@/pages/Catalog"
import TestPage from "@/pages/TestPage"
import LoginPage from "@/pages/LoginPage"
import MyResults from "@/pages/MyResults"

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/test/:id" element={<TestPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/results" element={<MyResults />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}