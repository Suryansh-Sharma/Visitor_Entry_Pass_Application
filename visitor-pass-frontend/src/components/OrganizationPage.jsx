import {
  BankOutlined,
  DeleteOutlined,
  PlusOutlined,
  StopOutlined,
  CheckCircleOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useContext, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { VisitorEntryPassContext } from "../context/VisitorEntryPassContext";
import {
  CREATE_USER,
  DELETE_USER,
  GET_ALL_USERS,
  SET_USER_ACTIVE,
  UPDATE_ORGANIZATION,
  UPDATE_USER_ROLE,
} from "../graphQl/queries";
import { LoadingComponent } from "./LoadingComponent";

const { Title, Text } = Typography;
const MySwal = withReactContent(Swal);

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "ADMIN" },
  { value: "RECEPTIONIST", label: "RECEPTIONIST" },
  { value: "TEACHER", label: "TEACHER" },
  { value: "USER", label: "USER" },
  { value: "EXTRA", label: "EXTRA" },
];

function OrganizationPage() {
  const { organization, refetchOrganization, userInfo } = useContext(
    VisitorEntryPassContext,
  );
  const [orgForm] = Form.useForm();
  const [userForm] = Form.useForm();

  useEffect(() => {
    document.title = "Organization Settings";
  }, []);

  useEffect(() => {
    if (organization) {
      orgForm.setFieldsValue(organization);
    }
  }, [organization, orgForm]);

  const [updateOrganization, { loading: savingOrg }] = useMutation(
    UPDATE_ORGANIZATION,
    { fetchPolicy: "no-cache" },
  );

  const {
    data: usersData,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useQuery(GET_ALL_USERS, { fetchPolicy: "network-only" });

  const [createUser, { loading: creatingUser }] = useMutation(CREATE_USER, {
    fetchPolicy: "no-cache",
  });
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE, {
    fetchPolicy: "no-cache",
  });
  const [setUserActive] = useMutation(SET_USER_ACTIVE, {
    fetchPolicy: "no-cache",
  });
  const [deleteUser] = useMutation(DELETE_USER, { fetchPolicy: "no-cache" });

  const users = usersData?.getAllUsers ?? [];

  const handleOrgSubmit = async (values) => {
    try {
      const { data } = await updateOrganization({ variables: { input: values } });
      if (data) {
        await refetchOrganization();
        MySwal.fire({
          title: "Saved",
          text: "Organization details updated successfully.",
          icon: "success",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (error) {
      MySwal.fire({ title: "Error", text: error.message, icon: "error" });
    }
  };

  const handleCreateUser = async (values) => {
    try {
      await createUser({ variables: { input: values } });
      userForm.resetFields();
      await refetchUsers();
      MySwal.fire({
        title: "User Added",
        text: `${values.username} can now log in immediately.`,
        icon: "success",
        confirmButtonColor: "#2563eb",
      });
    } catch (error) {
      MySwal.fire({ title: "Error", text: error.message, icon: "error" });
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole({ variables: { userId, role } });
      await refetchUsers();
    } catch (error) {
      MySwal.fire({ title: "Error", text: error.message, icon: "error" });
    }
  };

  const handleActiveToggle = async (userId, isActive) => {
    try {
      await setUserActive({ variables: { userId, isActive } });
      await refetchUsers();
    } catch (error) {
      MySwal.fire({ title: "Error", text: error.message, icon: "error" });
    }
  };

  const handleDeleteUser = async (userId, username) => {
    try {
      await deleteUser({ variables: { userId } });
      await refetchUsers();
      MySwal.fire({
        title: "Removed",
        text: `${username} has been removed.`,
        icon: "success",
        confirmButtonColor: "#2563eb",
      });
    } catch (error) {
      MySwal.fire({ title: "Error", text: error.message, icon: "error" });
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => (
        <Space size="small">
          <UserOutlined className="text-slate-400" />
          <Text className="font-semibold text-slate-800 text-xs">{text}</Text>
        </Space>
      ),
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      render: (text) => (
        <span className="text-xs text-slate-500">{text || "—"}</span>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 160,
      render: (role, record) => (
        <Select
          size="small"
          value={role}
          options={ROLE_OPTIONS}
          disabled={record.id === userInfo?.id}
          className="w-full text-xs"
          onChange={(value) => handleRoleChange(record.id, value)}
        />
      ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      width: 90,
      align: "center",
      render: (isActive, record) => (
        <Switch
          size="small"
          checked={isActive}
          disabled={record.id === userInfo?.id}
          onChange={(checked) => handleActiveToggle(record.id, checked)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Remove this user?"
          description={`This will permanently delete ${record.username}'s account.`}
          onConfirm={() => handleDeleteUser(record.id, record.username)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          disabled={record.id === userInfo?.id}
        >
          <Tooltip title="Delete user">
            <Button
              type="text"
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              disabled={record.id === userInfo?.id}
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  if (savingOrg || usersLoading || creatingUser) return <LoadingComponent />;

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <Title level={4} className="!m-0 !font-bold text-slate-800 tracking-tight">
              Organization Settings
            </Title>
            <Text type="secondary" className="text-xs">
              Manage your organization details and staff accounts.
            </Text>
          </div>
          <BankOutlined className="text-xl text-blue-500 bg-blue-50 p-2.5 rounded-xl border border-blue-100" />
        </div>

        <Card
          className="shadow-sm border-slate-200/80 rounded-xl"
          title={
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Organization Details
            </span>
          }
        >
          <Form
            form={orgForm}
            layout="vertical"
            onFinish={handleOrgSubmit}
            requiredMark={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                label="Organization Name"
                name="organizationName"
                rules={[{ required: true, message: "Organization name is required" }]}
              >
                <Input className="h-10 rounded-lg text-sm" />
              </Form.Item>
              <Form.Item label="Organization Type" name="organizationType">
                <Input className="h-10 rounded-lg text-sm" />
              </Form.Item>
              <Form.Item label="Address" name="organizationAddress">
                <Input className="h-10 rounded-lg text-sm" />
              </Form.Item>
              <Form.Item label="Phone" name="organizationPhone">
                <Input className="h-10 rounded-lg text-sm" />
              </Form.Item>
              <Form.Item label="Email" name="organizationEmail">
                <Input className="h-10 rounded-lg text-sm" />
              </Form.Item>
            </div>
            <Button
              type="primary"
              htmlType="submit"
              className="h-10 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-500 border-none"
            >
              Save Changes
            </Button>
          </Form>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <Card
            className="shadow-sm border-slate-200/80 rounded-xl"
            title={
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Add New User
              </span>
            }
          >
            <Form
              form={userForm}
              layout="vertical"
              onFinish={handleCreateUser}
              initialValues={{ role: "RECEPTIONIST" }}
              requiredMark={false}
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: "Username is required" }]}
              >
                <Input className="h-10 rounded-lg text-xs" />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Password is required" },
                  { min: 6, message: "At least 6 characters" },
                ]}
              >
                <Input.Password className="h-10 rounded-lg text-xs" />
              </Form.Item>
              <Form.Item label="Contact" name="contact">
                <Input className="h-10 rounded-lg text-xs" />
              </Form.Item>
              <Form.Item label="Role" name="role" rules={[{ required: true }]}>
                <Select options={ROLE_OPTIONS} className="h-10 text-xs" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                block
                className="h-10 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-500 border-none"
              >
                Create User
              </Button>
            </Form>
          </Card>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="bg-slate-50/70 px-4 py-3 border-b border-slate-200/60 flex items-center justify-between">
              <Space size="small">
                <TeamOutlined className="text-blue-500 text-xs" />
                <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Staff Accounts
                </Text>
              </Space>
              <Tag color="blue" className="font-bold text-[10px] rounded-full px-2 m-0 font-mono">
                Total Users: {users.length}
              </Tag>
            </div>
            <Table
              dataSource={users}
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

export default OrganizationPage;
