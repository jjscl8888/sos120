import { useState, useEffect } from 'react';
import { Tree, Button, Modal, Form, Input, message } from 'antd';
import axios from 'axios';

const AdminPage = ({ onCategoriesUpdate }) => {
  const [treeData, setTreeData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formType, setFormType] = useState('category');
  const [selectedParent, setSelectedParent] = useState(null);
  const [newName, setNewName] = useState(''); // 新增状态变量
  const [isContentModalVisible, setIsContentModalVisible] = useState(false);
  const [form] = Form.useForm();
const [contentForm] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/getCategories`);
      const tree = response.data.map(category => ({
        title: category.categoryKey,
        key: category.id,
        children: category.subcategories?.map((sub, index) => ({
          title: sub,
          key: `${category.id}-${index}`
        })) || []
      }));
      setTreeData(tree);
    } catch (error) {
      message.error('获取分类数据失败');
    }
  };

  const showAddModal = (type, parentKey) => {
    setFormType(type);
    setSelectedParent(parentKey);
    setIsModalVisible(true);
  };

  const showContentModal = async (node) => {
    try {
      // Fix: Use node.key instead of node.parentKey
      const categoryKey = node.key.split('-')[0];
      const category = treeData.find(c => c.key === categoryKey);
      
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/content/${encodeURIComponent(category.title)}/${encodeURIComponent(node.title)}`);
      
      if (response.data) {
        contentForm.setFieldsValue({
          title: response.data.title,
          steps: response.data.steps.join('\n'),
          precautions: response.data.precautions.join('\n'),
          videoURLs: response.data.videoURL?.join('\n')
        });
      } else {
        contentForm.resetFields();
      }
    } catch (error) {
      console.log('Error fetching content:', error);
      contentForm.resetFields();
    }
    setSelectedParent(node.key);
    setIsContentModalVisible(true);
  };
  const handleDelete = async (node) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/delete`, {
        params: {
          parentCategory: node.key.includes('-') ? node.key.split('-')[0] : null,
          categoryId: node.key, // 传递主键 ID
          subcategoryName: node.key.includes('-') ? node.title : null
        }
      });
      if (response.status === 200) {
        message.success('删除成功');
        fetchCategories();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      message.error(error.response?.data || '删除失败');
      console.error('Error:', error);
    }
  };

  const handleContentSubmit = async (values) => {
    try {
      const params = new URLSearchParams();
      // 获取一级和二级分类名称
      const [categoryKey, subcategoryKey] = selectedParent.split('-');
      const category = treeData.find(node => node.key === categoryKey);
      const subcategory = category?.children?.find(child => child.key === selectedParent);

      params.append('categoryKey', category?.title || '');
      params.append('subcategoryKey', subcategory?.title || '');
      params.append('title', values.title);
      
      // 处理 steps 参数
      values.steps.split('\n').filter(s => s.trim()).forEach(step => {
        params.append('steps', step);
      });
      
      // 处理 precautions 参数
      values.precautions.split('\n').filter(s => s.trim()).forEach(precaution => {
        params.append('precautions', precaution);
      });
      
      // 处理 videoURLs 参数（可选）
      if (values.videoURLs) {
        values.videoURLs.split('\n').filter(s => s.trim()).forEach(url => {
          params.append('videoURLs', url);
        });
      }
      
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/createContent`, null, { params });
      message.success('内容创建成功');
      setIsContentModalVisible(false);
      contentForm.resetFields();
    } catch (error) {
      message.error('内容创建失败');
    }
  };

  const handleSubmit = async values => {
    try {
      const payload = {
        parentCategory: formType === 'subcategory' ? selectedParent : null,
        subcategory: values.name
      };

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/create`, null, {
        params: payload
      });
      message.success('操作成功');
      setIsModalVisible(false);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      message.error('操作失败');
      console.error('Error:', error);
    }
  };

  const handleUpdate = async (node) => {
    let newName = node.title;

    Modal.confirm({
      title: '修改分类名称',
      content: (
        <Input 
          placeholder="请输入新名称"
          defaultValue={node.title}
          onChange={(e) => (newName = e.target.value)}
        />
      ),
      onOk: async () => {
        try {
          await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/update`, null, {
            params: {
              parentCategory: node.key.includes('-') ? node.key.split('-')[0] : null,
              categoryId: node.key,
              subcategoryName: node.key.includes('-') ? node.title : null,
              newName: newName || node.title
            }
          });
          message.success('修改成功');
          fetchCategories();
          if (onCategoriesUpdate) {
            console.log('触发父组件更新');
            onCategoriesUpdate();
          } else {
            console.error('onCategoriesUpdate 回调未定义');
          }
        } catch (error) {
          message.error(error.response?.data || '修改失败');
        }
      }
    });
  };
  return (
    <div className="admin-container">
      <div className="toolbar">
        <Button type="primary" onClick={() => showAddModal('category')}>
          新增一级分类
        </Button>
      </div>

      <Tree
        treeData={treeData}
        titleRender={node => {
          const isLeafNode = !node.children?.length;
          const isSecondLevel = node.key.includes('-'); // 二级节点 key 包含 '-'
          const showButton = !isLeafNode || (isLeafNode && !isSecondLevel);

          return (
            <div className="tree-node">
              <span>{node.title}</span>
              {showButton && (
                <Button 
                  size="small"
                  onClick={() => showAddModal('subcategory', node.key)}
                >
                  添加子分类
                </Button>
              )}
              <Button 
                size="small"
                onClick={() => handleUpdate(node)}
                style={{ marginLeft: 8 }}
              >
                修改
              </Button>
               <Button 
                size="small" 
                danger
                onClick={() => handleDelete(node)}
                style={{ marginLeft: 8 }}
              >
                删除
              </Button>
              {isSecondLevel && (<Button 
                size="small"
                type="primary"
                onClick={() => showContentModal(node)}
                style={{ marginLeft: 8 }}
              >
                修改内容
              </Button> )}
            </div>
          );
        }}
      />

  
      <Modal
        title="新建急救指南内容"
        visible={isContentModalVisible}
        onCancel={() => setIsContentModalVisible(false)}
        footer={null}
      >
        <Form form={contentForm} onFinish={handleContentSubmit}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入内容标题" />
          </Form.Item>
          
          <Form.Item
            name="steps"
            label="操作步骤"
            rules={[{ required: true, message: '请至少输入一个操作步骤' }]}
          >
            <Input.TextArea placeholder="每行一个步骤，按回车分隔" autoSize />
          </Form.Item>

          <Form.Item
            name="precautions"
            label="注意事项"
            rules={[{ required: true, message: '请至少输入一个注意事项' }]}
          >
            <Input.TextArea placeholder="每行一个注意事项，按回车分隔" autoSize />
          </Form.Item>

          <Form.Item
            name="videoURLs"
            label="视频链接"
          >
            <Input.TextArea placeholder="每行一个视频URL，按回车分隔" autoSize />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`新增${formType === 'category' ? '一级' : '二级'}分类`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit}>
          {formType === 'subcategory' && (
            <Form.Item
              label="一级分类"
            >
              <Input 
                value={treeData.find(node => node.key === selectedParent)?.title}
                disabled
              />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPage;

