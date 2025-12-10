import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Tag, message, Tooltip, Modal } from 'antd';
import { 
  EyeOutlined, 
  CopyOutlined, 
  HeartOutlined, 
  HeartFilled,
  EditOutlined,
  DeleteOutlined,
  GlobalOutlined,
  LockOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { getImage, incrementViewCount, deleteImage } from '../services/imageService';
import { addFavorite, removeFavorite, isFavorited } from '../services/favoriteService';
import { useAuth } from '../hooks/useAuth';
import DOMPurify from 'dompurify';

import type { Image } from '../../shared/types';

export default function ImageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: image, isLoading, refetch } = useQuery<Image, Error>({
    queryKey: ['image', id],
    queryFn: () => getImage(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (image?.id) {
      incrementViewCount(image.id);
    }
  }, [image?.id]);

  const { data: favorited } = useQuery<boolean, Error>({
    queryKey: ['favorite', id, user?.id],
    queryFn: () => isFavorited(id!, user!.id),
    enabled: !!id && !!user,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">图片不存在</h2>
        <Button type="primary" onClick={() => navigate('/')}>
          返回首页
        </Button>
      </div>
    );
  }

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(image.prompt);
      setCopied(true);
      message.success('提示词已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      message.error('复制失败，请手动复制');
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      message.warning('请先登录');
      return;
    }

    try {
      if (favorited) {
        await removeFavorite(image.id, user.id);
        message.success('已取消收藏');
      } else {
        await addFavorite(image.id, user.id);
        message.success('收藏成功');
      }
      refetch();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async () => {
    if (!user) {
      message.error('请先登录');
      navigate('/login');
      return;
    }
    if (user.id !== image.user_id) {
      message.error('无权限删除该图片');
      return;
    }
    Modal.confirm({
      title: '确认删除该图片？',
      content: '删除后不可恢复，并会从 ImgBB 移除。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteImage(image.id);
          message.success('已删除');
          navigate('/');
        } catch (e) {
          message.error('删除失败，请重试');
        }
      },
    });
  };

  const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          返回
        </Button>
        
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{image.title}</h1>
          
          <div className="flex items-center gap-2">
            <Tooltip title={image.visibility === 'public' ? '公开可见' : '仅自己可见'}>
              <Tag 
                icon={image.visibility === 'public' ? <GlobalOutlined /> : <LockOutlined />}
                color={image.visibility === 'public' ? 'blue' : 'orange'}
              >
                {image.visibility === 'public' ? '公开' : '私有'}
              </Tag>
            </Tooltip>
            
            {user && image.user_id === user.id && (
              <div className="flex gap-2">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/edit/${image.id}`)}
                >
                  编辑
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  删除
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={image.imgbb_url}
              alt={image.title}
              className="w-full h-auto object-contain max-h-[600px]"
              loading="lazy"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <EyeOutlined />
                {image.view_count} 次浏览
              </span>
              {image.user && (
                <span>作者: {image.user.username}</span>
              )}
              {image.category && (
                <Tag>{image.category.name}</Tag>
              )}
            </div>
            <span>{new Date(image.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Prompt Section */}
        <div className="space-y-4">
          <Card title="AI提示词" className="shadow-sm">
            <div className="space-y-4">
              <div 
                className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto font-mono text-sm"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(image.prompt.replace(/\n/g, '<br/>'))
                }}
              />
              
              <div className="flex gap-2">
                <Button
                  type="primary"
                  icon={<CopyOutlined />}
                  onClick={copyPrompt}
                  className="flex-1"
                >
                  {copied ? '已复制!' : '复制提示词'}
                </Button>
                
                <Button
                  icon={favorited ? <HeartFilled style={{ color: '#ff4757' }} /> : <HeartOutlined />}
                  onClick={toggleFavorite}
                  className="flex-1"
                >
                  {favorited ? '已收藏' : '收藏'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Metadata Card */}
          <Card title="图片信息" className="shadow-sm">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">可见性:</span>
                <Tag 
                  icon={image.visibility === 'public' ? <GlobalOutlined /> : <LockOutlined />}
                  color={image.visibility === 'public' ? 'blue' : 'orange'}
                >
                  {image.visibility === 'public' ? '公开' : '私有'}
                </Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">创建时间:</span>
                <span>{new Date(image.created_at).toLocaleString()}</span>
              </div>
              {image.user && (
                <div className="flex justify-between">
                  <span className="text-gray-600">作者:</span>
                  <span>{image.user.username}</span>
                </div>
              )}
              {image.category && (
                <div className="flex justify-between">
                  <span className="text-gray-600">分类:</span>
                  <Tag>{image.category.name}</Tag>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
