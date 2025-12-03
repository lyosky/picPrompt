import { useSearchParams } from 'react-router-dom';
import Home from './Home';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          搜索结果: "{query}"
        </h1>
        {query && (
          <p className="text-gray-600 mt-2">
            为您找到相关图片
          </p>
        )}
      </div>
      <Home />
    </div>
  );
}