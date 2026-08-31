"use client";
import React, { useState } from "react";
import { Button, Modal, Form, Input, Select, ColorPicker, Tooltip, Space, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined, InboxOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import PracticeBreadcrumbs from "../Practice_utils/practiceBreadcrumbs";
import styles from "../practiceStyles.module.scss";
import { fetchCompanyTests, createCompanyTest, deleteCompanyTest } from "@/redux/slices/admin/cms/practiceSlice";

export default function CompanyWiseAdminPage() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { companyTests = [], status } = useSelector((state) => state.adminPractice);

  React.useEffect(() => {
    dispatch(fetchCompanyTests());
  }, [dispatch]);

  const getAvatarColor = (name) => {
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#14B8A6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ").filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleCreate = async (values) => {
    const newCompany = {
      title: values.name,
      initials: getInitials(values.name),
      color: getAvatarColor(values.name),
      hiringType: values.hiringType,
      patternName: values.patternName,
      sections: [],
    };
    await dispatch(createCompanyTest(newCompany));
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleOpenSubject = (record) => {
    router.push(`/admin/practice/company-wise/${record._id}`);
  };

  return (
    <div className={styles.container}>
      {/* Header with Breadcrumbs and Add Button */}
      <div className={styles.header}>
        <PracticeBreadcrumbs />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{ width: "12rem" }}
        >
          Add Company Test
        </Button>
      </div>

      {/* List of Companies */}
      {status === 'loading' ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading company tests...</div>
      ) : companyTests.length > 0 ? (
        <div className={styles.cardsList}>
          {companyTests.map((record, index) => (
            <div
              key={record._id}
              className={styles.itemCard}
              onClick={() => handleOpenSubject(record)}
            >
              {/* Avatar */}
              <div
                className={styles.itemAvatar}
                style={{ backgroundColor: record.color }}
              >
                {record.initials}
              </div>

              {/* Info */}
              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>
                  {record.title}
                </span>
                <span className={styles.itemSubtitle}>
                  {record.hiringType} • {record.patternName}
                </span>
              </div>

              {/* Meta */}
              <div className={styles.itemMeta}>
                <span className={styles.statusBadgeCard}>
                  <span className={styles.statusDotCard}></span>
                  Active
                </span>
              </div>

              {/* Actions */}
              <div 
                className={styles.itemActions}
                onClick={(e) => e.stopPropagation()}
              >
                <Space>
                  <Tooltip title="Edit">
                    <Button
                      type="text"
                      icon={<EditOutlined style={{ color: "#1890ff" }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Edit logic here
                      }}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="Delete this company?"
                    onConfirm={(e) => {
                      e.stopPropagation();
                      dispatch(deleteCompanyTest(record._id));
                    }}
                    onCancel={(e) => e.stopPropagation()}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Tooltip title="Delete">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Tooltip>
                  </Popconfirm>
                </Space>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.cardEmptyState}>
          <InboxOutlined className={styles.cardEmptyIcon} />
          <span className={styles.cardEmptyText}>No Company Tests Found</span>
          <span className={styles.cardEmptySub}>
            Start by adding your first company test
          </span>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            + Add Company
          </Button>
        </div>
      )}

      {/* Modal */}
      <Modal
        title="Add New Company Test"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Create Company"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
          <Form.Item
            name="name"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="e.g. TCS" />
          </Form.Item>

          <Form.Item
            name="hiringType"
            label="Hiring Type tag"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="Mass Recruiter">Mass Recruiter</Select.Option>
              <Select.Option value="Volume Hirer">Volume Hirer</Select.Option>
              <Select.Option value="Dream Company">Dream Company</Select.Option>
              <Select.Option value="Super Dream">Super Dream</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="patternName"
            label="Test Pattern Name"
            rules={[{ required: true, message: 'Please enter pattern name' }]}
          >
            <Input placeholder="e.g. TCS NQT" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
