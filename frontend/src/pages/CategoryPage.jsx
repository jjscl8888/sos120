import { useParams, Navigate } from 'react-router-dom';

export default function CategoryPage({ categories }) {
  const { category } = useParams();
  const formattedData = categories.reduce((acc, curr) => {
    acc[curr.categoryKey] = curr.subcategories;
    return acc;
  }, {});
  const subCategories = formattedData[category] || [];

  // 如果有子分类，默认跳转到第一个子分类
  if (subCategories.length > 0) {
    return <Navigate to={`/${category}/${subCategories[0].replace(/\s+/g, '-')}`} replace />;
  }

  return (
    <div className="category-content">
      <h2>{category}指南</h2>
      <div className="subcategory-list">
        {subCategories.map((sub) => (
          <div key={sub} className="subcategory-item">
            <h3>{sub}</h3>
            <p>这里展示{category}分类下{sub}的具体急救步骤和操作指南...</p>
          </div>
        ))}
      </div>
    </div>
  );
}