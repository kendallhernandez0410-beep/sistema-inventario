import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import Categorias from './pages/Categorias.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import NoEncontrada from './pages/NoEncontrada.jsx';
import Productos from './pages/Productos.jsx';
import Proveedores from './pages/Proveedores.jsx';
import Registro from './pages/Registro.jsx';
import PanelUsuario from './pages/PanelUsuario.jsx';
import InicioPorRol from './pages/InicioPorRol.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route index element={<InicioPorRol />} />
          <Route element={<RutaProtegida role="admin" />}>
            <Route path="admin" element={<Dashboard />} />
            <Route path="productos" element={<Productos />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="proveedores" element={<Proveedores />} />
          </Route>
          <Route element={<RutaProtegida role="usuario" />}>
            <Route path="usuario" element={<PanelUsuario />} />
          </Route>
        </Route>
      </Route>
      <Route path="/inicio" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  );
}
