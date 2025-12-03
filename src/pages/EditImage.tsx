import { useEffect, useState } from 'react';
import { Form, Input, Select, Switch, Button, Card, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getImage, updateImage } from '../services/imageService';
import { getCategories } from '../services/categoryService';
import type { Category, Image } from '../../shared/types';
import { useAuth } from '../hooks/useAuth';

const { TextArea } = Input;
const { Option } = Select;

export default function EditImage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const { data: image } = useQuery<Image | undefined>({
    queryKey: ['image', id],
    queryFn: async () => (id ? await getImage(id) : undefined),
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  useEffect(() => {
    if (image) {
      form.setFieldsValue({
        title: image.title,
        prompt: image.prompt,
        category_id: image.category_id,
        visibility: image.visibility === 'public',
      });
    }
  }, [image, form]);

  useEffect(() => {
    if (image && user && image.user_id !== user.id) {
      message.error('无权限编辑该图片');
      navigate(-1);
    }
  }, [image, user, navigate]);

  const onFinish = async (values: any) => {
    if (!user) {
      message.error('请先登录');
      navigate('/login');
      return;
    }
    if (!id) return;
    setSaving(true);
    try {
      await updateImage(id, {
        title: values.title,
        prompt: values.prompt,
        category_id: values.category_id,
        visibility: values.visibility ? 'public' : 'private',
      });
      message.success('更新成功');
      navigate(`/image/${id}`);
    } catch (e) {
      message.error('更新失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (!image) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <div className="text-center py-12">加载中或图片不存在</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card title="编辑图片" className="shadow-sm">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="图片标题" rules={[{ required: true, message: '请输入图片标题' }]}>
            <Input placeholder="请输入图片标题" />
          </Form.Item>

          <Form.Item name="prompt" label="AI提示词" rules={[{ required: true, message: '请输入AI提示词' }]}>
            <TextArea rows={4} placeholder="请输入详细的AI绘画提示词，包括风格、细节、参数等..." />
          </Form.Item>

          <Form.Item name="category_id" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择分类">
              {categories.map((category: Category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="visibility" label="可见性" valuePropName="checked" help="开启后图片将对所有用户可见，关闭后仅自己可见">
            <Switch checkedChildren="公开" unCheckedChildren="私有" />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-4">
              <Button type="primary" htmlType="submit" loading={saving}>
                保存
              </Button>
              <Button onClick={() => navigate(-1)}>取消</Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

