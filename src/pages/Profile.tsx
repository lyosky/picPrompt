import { useEffect, useRef, useState } from 'react';
import { Tabs, Card, Button, message } from 'antd';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { getUserFavoritesPage } from '../services/favoriteService';
import { getUserImagesPage } from '../services/imageService';
import { useNavigate } from 'react-router-dom';
import { HeartOutlined, PictureOutlined, UserOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('favorites');

  const pageSize = 20;
  const {
    data: favoritesData,
    fetchNextPage: fetchNextFavorites,
    isFetchingNextPage: isFetchingNextFavorites,
    hasNextPage: hasNextFavorites,
  } = useInfiniteQuery({
    queryKey: ['userFavoritesInfinite', user?.id],
    enabled: !!user,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getUserFavoritesPage(user!.id, pageParam, pageParam + pageSize - 1),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === pageSize ? allPages.length * pageSize : undefined,
  });

  const {
    data: userImagesData,
    fetchNextPage: fetchNextImages,
    isFetchingNextPage: isFetchingNextImages,
    hasNextPage: hasNextImages,
  } = useInfiniteQuery({
    queryKey: ['userImagesInfinite', user?.id],
    enabled: !!user,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getUserImagesPage(user!.id, pageParam, pageParam + pageSize - 1),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === pageSize ? allPages.length * pageSize : undefined,
  });

  const favorites = (favoritesData?.pages ?? []).flat();
  const userImages = (userImagesData?.pages ?? []).flat();
  const favoritesLoaderRef = useRef<HTMLDivElement | null>(null);
  const uploadsLoaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab !== 'favorites') return;
    const el = favoritesLoaderRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isFetchingNextFavorites) {
          fetchNextFavorites();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [activeTab, fetchNextFavorites, isFetchingNextFavorites]);

  useEffect(() => {
    if (activeTab !== 'uploads') return;
    const el = uploadsLoaderRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isFetchingNextImages) {
          fetchNextImages();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [activeTab, fetchNextImages, isFetchingNextImages]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
        <Button type="primary" onClick={() => navigate('/login')}>
          前往登录
        </Button>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut();
      message.success('退出登录成功');
      navigate('/');
    } catch (error) {
      message.error('退出登录失败');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* User Info Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserOutlined className="text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                注册时间: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button onClick={handleLogout}>退出登录</Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Card className="shadow-sm">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <HeartOutlined />
                我的收藏 ({favorites.length})
              </span>
            }
            key="favorites"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/image/${favorite.image.id}`)}
                >
                  <img
                    src={favorite.image.imgbb_url}
                    alt={favorite.image.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{favorite.image.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {favorite.image.prompt.substring(0, 100)}
                      {favorite.image.prompt.length > 100 && '...'}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>{new Date(favorite.created_at).toLocaleDateString()}</span>
                      <span>{favorite.image.view_count} 浏览</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div ref={favoritesLoaderRef} className="flex justify-center py-6">
              {isFetchingNextFavorites ? (
                <span className="text-gray-500">加载中...</span>
              ) : hasNextFavorites === false ? (
                <span className="text-gray-400">没有更多了</span>
              ) : (
                <span className="text-gray-300">下拉加载更多</span>
              )}
            </div>
            
            {favorites.length === 0 && (
              <div className="text-center py-12">
                <HeartOutlined className="text-4xl text-gray-300 mb-4" />
                <p className="text-gray-500">还没有收藏任何图片</p>
                <Button type="primary" onClick={() => navigate('/')} className="mt-4">
                  去发现图片
                </Button>
              </div>
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <PictureOutlined />
                我的上传 ({userImages.length})
              </span>
            }
            key="uploads"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userImages
                .filter((image) => image.user_id === user.id)
                .map((image) => (
                  <div
                    key={image.id}
                    className="bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/image/${image.id}`)}
                  >
                    <img
                      src={image.imgbb_url}
                      alt={image.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{image.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {image.prompt.substring(0, 100)}
                        {image.prompt.length > 100 && '...'}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>{new Date(image.created_at).toLocaleDateString()}</span>
                        <span>{image.view_count} 浏览</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div ref={uploadsLoaderRef} className="flex justify-center py-6">
              {isFetchingNextImages ? (
                <span className="text-gray-500">加载中...</span>
              ) : hasNextImages === false ? (
                <span className="text-gray-400">没有更多了</span>
              ) : (
                <span className="text-gray-300">下拉加载更多</span>
              )}
            </div>
            
            {userImages.filter((image) => image.user_id === user.id).length === 0 && (
              <div className="text-center py-12">
                <PictureOutlined className="text-4xl text-gray-300 mb-4" />
                <p className="text-gray-500">还没有上传任何图片</p>
                <Button type="primary" onClick={() => navigate('/upload')} className="mt-4">
                  去上传图片
                </Button>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
