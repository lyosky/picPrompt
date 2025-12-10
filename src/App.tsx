import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, Button, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Home from './pages/Home';
import Upload from './pages/Upload';
import ImageDetail from './pages/ImageDetail';
import EditImage from './pages/EditImage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Category from './pages/Category';
import Search from './pages/Search';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function HeaderBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-900">PicPrompt</Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-gray-700">{user.username}</span>
              <Button type="primary" onClick={() => navigate('/upload')}>上传</Button>
              <Button onClick={() => navigate('/profile')}>我的</Button>
              <Button
                onClick={async () => {
                  await signOut();
                  message.success('已退出登录');
                  navigate('/');
                }}
              >退出登录</Button>
            </>
          ) : (
            <>
              <Button onClick={() => navigate('/login')}>登录</Button>
              <Button onClick={() => navigate('/register')}>注册</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <HeaderBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/image/:id" element={<ImageDetail />} />
            <Route path="/edit/:id" element={<EditImage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
