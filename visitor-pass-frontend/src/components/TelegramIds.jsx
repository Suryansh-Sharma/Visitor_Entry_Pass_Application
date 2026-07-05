import React, { useContext, useEffect } from "react";
import { useMutation } from "@apollo/client";
import {
  Form,
  Input,
  Button,
  Table,
  Card,
  Select,
  Tag,
  Typography,
  Space,
  Tooltip,
  Popconfirm,
  Avatar,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  IdcardOutlined,
  DeleteOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { VisitorEntryPassContext } from "../context/VisitorEntryPassContext";
import { Add_New_TelegramId, Delete_TelegramId } from "../graphQl/queries";
import { LoadingComponent } from "./LoadingComponent";

const { Title, Text } = Typography;
const MySwal = withReactContent(Swal);

function TelegramIds() {
  const { allTelegramIds } = useContext(VisitorEntryPassContext);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = "Telegram Notification Registry";
  }, []);

  // --- API MUTATION HOOKS WITH CACHE CLEANING CONTROLS ---
  const [addNewTelegramApi, { loading: addLoading }] = useMutation(
    Add_New_TelegramId,
    {
      fetchPolicy: "no-cache",
      refetchQueries: ["GET_ALL_TELEGRAM_IDS"],
    },
  );

  const [deleteTelegramApi, { loading: deleteLoading }] = useMutation(
    Delete_TelegramId,
    {
      fetchPolicy: "no-cache",
      refetchQueries: ["GET_ALL_TELEGRAM_IDS"],
    },
  );

  // --- SUBMIT CONTROLLER ---
  const handleFormSubmit = async (values) => {
    try {
      const telegramPayload = {
        hostName: values.hostName.trim(),
        chatId: values.chatId.trim(),
        role: values.role,
      };

      await addNewTelegramApi({
        variables: { input: telegramPayload },
      });

      form.resetFields();

      MySwal.fire({
        title: "Registry Entry Logged",
        text: `Successfully registered communication channel parameters for ${telegramPayload.hostName}.`,
        icon: "success",
        confirmButtonColor: "#2563eb",
      });
    } catch (error) {
      console.error(error);
      MySwal.fire({
        title: "Submission Fault",
        text: error.message || "GraphQL compilation server exception drop.",
        icon: "error",
      });
    }
  };

  // --- DELETION CONTROLLER ---
  const handleDeleteTelegramId = async (id, name) => {
    try {
      await deleteTelegramApi({
        variables: { id: id },
      });
    } catch (error) {
      console.error(error);
      MySwal.fire({
        title: "Deletion Exception",
        text: error.message,
        icon: "error",
      });
    }
  };

  // --- ANT DESIGN TABLE STRUCTURAL COLUMNS SCHEMA ---
  const columns = [
    {
      title: "Index",
      key: "serialNumber",
      width: 70,
      align: "center",
      render: (_, __, index) => (
        <span className="font-mono text-xs font-semibold text-slate-400">
          {index + 1}
        </span>
      ),
    },
    {
      title: "Host Account Name",
      dataIndex: "hostName",
      key: "hostName",
      render: (text) => (
        <Space size="small">
          <Avatar
            size="small"
            icon={<UserOutlined />}
            className="bg-slate-100 text-slate-500 border border-slate-200"
          />
          <Text className="font-bold text-slate-800 text-xs tracking-tight">
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: "Telegram Chat ID Token",
      dataIndex: "chatId",
      key: "chatId",
      render: (id) => (
        <span className="font-mono text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-md shadow-inner">
          {id}
        </span>
      ),
    },
    {
      title: "Assigned Clearance Role",
      dataIndex: "role",
      key: "role",
      width: 140,
      render: (role) => {
        let tagColor = "blue";
        if (role === "RECEPTIONIST") tagColor = "purple";
        if (role === "EXTRA") tagColor = "default";
        return (
          <Tag
            color={tagColor}
            className="font-extrabold text-[9px] uppercase tracking-wider rounded-md px-2 m-0"
          >
            {role}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Delete Channel Track?"
          description={`Permanently discard notification parameters mapping target account: ${record.hostName}?`}
          onConfirm={() => handleDeleteTelegramId(record.id, record.hostName)}
          okText="Confirm Wipe"
          cancelText="Cancel"
          okButtonProps={{
            danger: true,
            className: "text-xs font-semibold h-8 rounded-lg",
          }}
          cancelButtonProps={{
            className: "text-xs font-medium h-8 rounded-lg",
          }}
        >
          <Tooltip title="Sever Dispatch Routing Link">
            <Button
              type="text"
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              className="hover:bg-red-50 flex items-center justify-center mx-auto"
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  if (addLoading || deleteLoading) return <LoadingComponent />;

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 font-sans select-none">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* TOP SYSTEM MODULE IDENTITY DECK */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <Title
              level={4}
              className="!m-0 !font-bold text-slate-800 tracking-tight"
            >
              Telegram Host Registry Engine
            </Title>
            <Text type="secondary" className="text-xs">
              Map system approval routing lines to target smartphone chat-bot
              accounts.
            </Text>
          </div>
          <SendOutlined className="text-xl text-blue-500 animate-pulse bg-blue-50 p-2.5 rounded-xl border border-blue-100" />
        </div>

        {/* CONTROLS DIVISION CONSOLE SPLIT CONTAINER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* COLUMN 1: INTERACTIVE FORM MANAGER CARD */}
          <Card
            className="shadow-sm border-slate-200/80 rounded-xl"
            title={
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Add New Secure Routing Line
              </span>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
              initialValues={{ role: "TEACHER" }}
              requiredMark={false}
            >
              <Form.Item
                label="Hostname Account Label"
                name="hostName"
                rules={[
                  {
                    required: true,
                    message: "Host account identity parameter required.",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400" />}
                  placeholder="e.g., Prof. Sharma"
                  className="h-10 rounded-lg text-xs font-medium text-slate-700"
                />
              </Form.Item>

              <Form.Item
                label="Telegram Chat ID"
                name="chatId"
                rules={[
                  {
                    required: true,
                    message: "Target token address is mandatory.",
                  },
                ]}
              >
                <Input
                  prefix={<IdcardOutlined className="text-slate-400" />}
                  placeholder="9-digit numerical sequence"
                  className="h-10 rounded-lg font-mono text-xs"
                />
              </Form.Item>

              <Form.Item
                label="Operational Authority Role"
                name="role"
                rules={[{ required: true }]}
              >
                <Select
                  className="h-10 text-xs font-semibold text-slate-700"
                  options={[
                    { value: "MANAGER", label: "MANAGER" },
                    { value: "TEACHER", label: "TEACHER STAFF" },
                    { value: "RECEPTIONIST", label: "RECEPTION DESK" },
                    { value: "EXTRA", label: "TEMPORARY / AUXILIARY" },
                  ]}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                block
                className="h-10 rounded-lg font-bold text-xs tracking-wide bg-blue-600 hover:bg-blue-500 border-none shadow-sm shadow-blue-50 mt-2"
              >
                Register Notification Line
              </Button>
            </Form>
          </Card>

          {/* COLUMN 2 & 3: MASTER ACCOUNT DATA RECOGNITION CONSOLE GRID */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="bg-slate-50/70 px-4 py-3 border-b border-slate-200/60 flex items-center justify-between">
              <Space size="small">
                <SafetyCertificateOutlined className="text-blue-500 text-xs" />
                <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Active Access Channels Console
                </Text>
              </Space>
              <Tag
                color="blue"
                className="font-bold text-[10px] rounded-full px-2 m-0 font-mono"
              >
                Total Channels: {allTelegramIds.length}
              </Tag>
            </div>

            <Table
              dataSource={allTelegramIds}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 7, showSizeChanger: false }}
              className="text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelegramIds;
