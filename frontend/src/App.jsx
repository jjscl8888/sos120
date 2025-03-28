import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import CategoryNavigation from './components/CategoryNavigation';
import CategoryPage from './pages/CategoryPage';
import SubCategoryPage from './pages/SubCategoryPage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/content/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('获取分类数据失败:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);


  return (
    <Router>
      <div className="app-layout">
        <header className="app-header">
          <Navigation categories={categories} />
        </header>
       
        <div className="app-main">
          <aside className="app-sidebar">
            <CategoryNavigation categories={categories} />
          </aside>
          <main className="app-content">
            <Routes>
              <Route path="/:category" element={<CategoryPage categories={categories} />} />
              <Route path="/:category/:subCategory" element={<SubCategoryPage />} />
              <Route path="/admin" element={<AdminPage onCategoriesUpdate={fetchCategories} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;


// function pk() {
//   const [e, t] = v.useState([]);
//   const n = async () => {
//     try {
//       const r = await $t.get(`${import.meta.env.VITE_API_BASE_URL}/api/content/categories`);
//       t(r.data);
//     } catch (r) {
//       console.error("获取分类数据失败:", r);
//     }
//   };
// }
