import { useState } from 'react';
import { Upload, Button, Form, Input, Select, Switch, message } from 'antd';
import { InboxOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload';
import { useNavigate } from 'react-router-dom';
import { createImage } from '../services/imageService';
import { getCategories } from '../services/categoryService';
import { useQuery } from '@tanstack/react-query';
import type { Category } from '../../shared/types';

const { Dragger } = Upload;
const { TextArea } = Input;
const { Option } = Select;

export default function UploadPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleUpload = async (values: any) => {
    if (fileList.length === 0) {
      message.error('请上传图片');
      return;
    }

    setUploading(true);
    try {
      const file = fileList[0].originFileObj as File;
      await createImage({
        title: values.title,
        prompt: values.prompt,
        category_id: values.category_id,
        visibility: values.visibility ? 'public' : 'private',
        image_file: file,
      });
      
      message.success('图片上传成功');
      navigate('/');
    } catch (error) {
      message.error('上传失败，请重试');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const props = {
    fileList,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB!');
        return false;
      }
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">上传图片</h1>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpload}
          initialValues={{
            visibility: true, // 默认公开
          }}
        >
          <Form.Item
            label="图片上传"
            rules={[{ required: true, message: '请上传图片' }]}
          >
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined className="text-4xl text-gray-400" />
              </p>
              <p className="ant-upload-text">点击或拖拽图片到此处上传</p>
              <p className="ant-upload-hint">
                支持单张图片上传，图片大小不超过5MB
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item
            name="title"
            label="图片标题"
            rules={[{ required: true, message: '请输入图片标题' }]}
          >
            <Input placeholder="请输入图片标题" />
          </Form.Item>

          <Form.Item
            name="prompt"
            label="AI提示词"
            rules={[{ required: true, message: '请输入AI提示词' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入详细的AI绘画提示词，包括风格、细节、参数等..."
            />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map((category: Category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="visibility"
            label="可见性"
            valuePropName="checked"
            help="开启后图片将对所有用户可见，关闭后仅自己可见"
          >
            <Switch
              checkedChildren="公开"
              unCheckedChildren="私有"
              defaultChecked
            />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
                icon={<PictureOutlined />}
                className="bg-blue-600 hover:bg-blue-700 border-blue-600"
              >
                {uploading ? '上传中...' : '发布图片'}
              </Button>
              <Button onClick={() => navigate(-1)}>取消</Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}