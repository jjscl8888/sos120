import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function SubCategoryPage() {
  const { category, subCategory } = useParams();
  const decodedSubCategory = subCategory?.replace(/-/g, ' ');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/content/${category}/${encodeURIComponent(decodedSubCategory)}`
        );
        setContent(response.data);
        setLoading(false);
      } catch (err) {
        setError('获取内容失败，请稍后再试');
        setLoading(false);
      }
    };

    if (decodedSubCategory) {
      fetchData();
    }
  }, [category, decodedSubCategory]);

  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">{error}</div>;
  
  if (!content) {
    return <div className="error">暂无该急救指南内容</div>;
  }

  return (
    <div className="subcategory-content">
      <h2>{content.title}</h2>
      <div className="guide-steps">
        <div className="steps-section">
          <h3>操作步骤：</h3>
          <ol>
            {content.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="precautions-section">
          <h3>注意事项：</h3>
          <ul>
            {content.precautions.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
      {content.videoURL && (
        <div className="video-section">
        <h3>教学视频：</h3>
        <div className="video-scroll-container">
          {[content.videoURL].flat().map((url, index) => (
            <div key={index} className="video-item">
              <ReactPlayer
                url={url}
                controls
                width="100%"
                height="100%"
                config={{ file: { attributes: { controlsList: 'nodownload' } } }}
              />
              <p className="video-tip">请在全屏模式下观看教学视频</p>
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}