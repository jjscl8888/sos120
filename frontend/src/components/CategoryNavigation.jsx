import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function CategoryNavigation({ categories }) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const category = decodeURIComponent(pathSegments[1]); // 解码中文分类名

  // 将 categories 转换为 { categoryKey: subcategories } 格式
  const formattedData = categories.reduce((acc, curr) => {
    acc[curr.categoryKey] = curr.subcategories;
    return acc;
  }, {});
  const subCategories = formattedData[category] || [];

  // 调试信息
  console.log('Received categories:', categories);
  console.log('Formatted data:', formattedData);
  console.log('Current category:', category);
  console.log('Subcategories:', subCategories);

  return (
    <div className="category-nav">
      {subCategories.map((sub) => (
        <Link 
          key={sub}
          to={`/${category}/${encodeURIComponent(sub).replace(/%20/g, '-')}`}
          className="nav-item"
        >
          <span className="nav-icon"></span>
          <span>{sub}</span>
        </Link>
      ))}
    </div>
  );
}