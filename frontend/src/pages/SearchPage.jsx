import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const { query } = useParams();
  useEffect(() => { 
   if(query) setSearchTerm(decodeURIComponent(query));
  }, [query]); // 新增参数监听
  const [searchTerm, setSearchTerm] = useState(query || '');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState(['创伤处理', '中毒急救', '心肺复苏', '止血方法', '烧伤护理']);

  const navigate = useNavigate();
  
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search/${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-box">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            // 模拟建议数据（后续对接接口）
            setSuggestions(['创伤处理', '中毒急救', '心肺复苏'].filter(item => 
              item.includes(e.target.value)
            ));
          }}
          placeholder="输入急救关键词"
          className="search-input"
        />
        <button type="submit" className="search-button">
          搜索急救指南
        </button>
        
        {/* 优化建议列表样式 */}
        {suggestions.length > 0 && (
          <div className="suggestions-panel">
            {suggestions.map((item) => (
              <div 
                key={item}
                className="suggestion-item"
                onClick={() => navigate(`/search/${encodeURIComponent(item)}`)}
              >
                <span className="search-icon">🔍</span>
                {item}
              </div>
            ))}
          </div>
        )}
      </form>

      {/* 优化搜索结果展示 */}
      <div className="search-results">
        {searchResults.length > 0 ? (
          <div className="result-grid">
            {searchResults.map((result) => (
              <div key={result.id} className="result-card">
                <h3>{result.title}</h3>
                <p className="result-excerpt">{result.content.slice(0, 100)}...</p>
                <div className="result-meta">
                  <span>👍 {result.likes}</span>
                  <span>📅 {result.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🕵️♂️</div>
            <p>输入急救关键词获取专业指南</p>
          </div>
        )}
      </div>
    </div>
  );
}