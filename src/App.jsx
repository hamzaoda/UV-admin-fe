// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Main from './pages/Main/Main';
import Sidebar from './components/Sidebar/Sidebar';

import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './redux/selectors';
import UserManagements from './pages/UserManagements/UserManagements';
import "./App.css"
const App = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <div className='main-content'>
      <Routes>
        {/* المسار الرئيسي، ينتقل إلى Main إذا كان المستخدم مصادقًا، وإلا إلى صفحة تسجيل الدخول */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/main" /> : <Navigate to="/login" />}
        />

        {/* مسار تسجيل الدخول */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/main" /> : <Login />}
        />

        {/* تخطيط يحتوي على Sidebar لجميع المسارات المحمية */}
        <Route
          element={isAuthenticated ? <Sidebar /> : <Navigate to="/login" />}
        />
        <Route
          element={<Sidebar />}
        >
          <Route
            path="/main"
            element={<Main />}
          />
                    <Route
            path="/user-managements"
            element={<UserManagements />}
          />


          {/* المسار الرئيسي بعد تسجيل الدخول */}
          {/* <Route
          path="/main"
          element={isAuthenticated ? <Main /> : <Navigate to="/login" />}
        /> */}
        </Route>
        {/* مسارات غير معروفة: إعادة التوجيه إلى المسار الرئيسي */}
        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>

      {/* المكونات الأخرى يمكن إضافتها هنا حسب الحاجة */}
    </div>
  );
};

export default App;