import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Input, Select, Tag, Button, message, Tooltip } from 'antd';
import { 
  CopyOutlined, 
  EyeOutlined, 
  HeartOutlined,
  GlobalOutlined,
  LockOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getImages } from '../services/imageService';
import { getCategories } from '../services/categoryService';
import { useAuth } from '../hooks/useAuth';
import { addFavorite } from '../services/favoriteService';
import type { Image } from '../../shared/types';

const { Search } = Input;
const { Option } = Select;

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['images', searchTerm, selectedCategory, visibilityFilter],
    queryFn: () => getImages({
      search: searchTerm,
      category: selectedCategory,
      visibility: visibilityFilter,
    }),
  });

  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      message.success('提示词已复制到剪贴板');
    } catch (error) {
      message.error('复制失败，请手动复制');
    }
  };

  const handleFavorite = async (imageId: string) => {
    if (!user) {
      message.warning('请先登录');
      return;
    }

    try {
      await addFavorite(imageId, user.id);
      message.success('收藏成功');
    } catch (error) {
      message.error('收藏失败');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Search
            placeholder="搜索图片标题或提示词..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={setSearchTerm}
            className="flex-1"
          />
          
          <Select
            placeholder="选择分类"
            allowClear
            size="large"
            style={{ minWidth: 200 }}
            onChange={setSelectedCategory}
            suffixIcon={<FilterOutlined />}
          >
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="可见性"
            allowClear
            size="large"
            style={{ minWidth: 120 }}
            value={visibilityFilter}
            onChange={setVisibilityFilter}
          >
            <Option value="all">全部</Option>
            <Option value="public">
              <GlobalOutlined className="mr-1" />
              公开
            </Option>
            <Option value="private">
              <LockOutlined className="mr-1" />
              私有
            </Option>
          </Select>
        </div>
      </div>

      {/* Images Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">暂无图片</div>
          <Button type="primary" onClick={() => navigate('/upload')}>
            上传第一张图片
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image: Image) => (
            <Card
              key={image.id}
              hoverable
              cover={
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => navigate(`/image/${image.id}`)}
                >
                  <img
                    alt={image.title}
                    src={image.imgbb_url}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button type="primary" size="small">
                        查看详情
                      </Button>
                    </div>
                  </div>
                  
                  {/* Visibility Badge */}
                  <div className="absolute top-2 right-2">
                    <Tooltip title={image.visibility === 'public' ? '公开可见' : '仅自己可见'}>
                      <Tag
                        icon={image.visibility === 'public' ? <GlobalOutlined /> : <LockOutlined />}
                        color={image.visibility === 'public' ? 'blue' : 'orange'}
                        className="m-0"
                      >
                        {image.visibility === 'public' ? '公开' : '私有'}
                      </Tag>
                    </Tooltip>
                  </div>
                </div>
              }
              actions={[
                <Tooltip title="复制提示词">
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyPrompt(image.prompt);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="收藏">
                  <Button
                    type="text"
                    icon={<HeartOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(image.id);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="查看详情">
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/image/${image.id}`);
                    }}
                  />
                </Tooltip>,
              ]}
            >
              <Card.Meta
                title={
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1">{image.title}</span>
                  </div>
                }
                description={
                  <div className="space-y-2">
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {image.prompt.substring(0, 100)}
                      {image.prompt.length > 100 && '...'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <EyeOutlined />
                        {image.view_count}
                      </span>
                      {image.user && (
                        <span>{image.user.username}</span>
                      )}
                      {image.category && (
                        <Tag size="small">{image.category.name}</Tag>
                      )}
                    </div>
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}