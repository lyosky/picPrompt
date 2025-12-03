import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Home from './pages/Home';
import Upload from './pages/Upload';
import ImageDetail from './pages/ImageDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Category from './pages/Category';
import Search from './pages/Search';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/image/:id" element={<ImageDetail />} />
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
