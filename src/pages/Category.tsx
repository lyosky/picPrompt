import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Tag } from 'antd';
import { getCategory } from '../services/categoryService';
import { getImages } from '../services/imageService';
import Home from './Home';

export default function Category() {
  const { id } = useParams<{ id: string }>();

  const { data: category } = useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategory(id!),
    enabled: !!id,
  });

  const { data: images = [] } = useQuery({
    queryKey: ['categoryImages', id],
    queryFn: () => getImages({ category: id }),
    enabled: !!id,
  });

  if (!category) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">分类不存在</h2>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600 mt-2">{category.description}</p>
            )}
          </div>
          <Tag color="blue">{images.length} 张图片</Tag>
        </div>
      </Card>
      
      <Home />
    </div>
  );
}