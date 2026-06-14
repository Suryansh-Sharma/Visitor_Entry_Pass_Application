import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { Button, Card, Form, Input, Typography } from "antd";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { VisitorEntryPassContext } from "../../context/VisitorEntryPassContext";
import { LOGIN_USER } from "../../graphQl/queries";
import { LoadingComponent } from "../LoadingComponent";

const { Title, Text } = Typography;

function LoginPage() {
  const { login } = useContext(VisitorEntryPassContext);
  const [form] = Form.useForm();

  const [loginUserApi, { loading }] = useMutation(LOGIN_USER, {
    fetchPolicy: "no-cache",
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login";
  }, []);

  const onLoginSubmit = async (values) => {
    try {
      const { data } = await loginUserApi({
        variables: {
          username: values.username,
          password: values.password,
        },
      });
      if (data) {
        login(data.loginUser);
        navigate("/", {
          replace: true,
          state: { message: `Welcome Back ${data.loginUser.username}` },
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Login failed!", { position: "top-center" });
    }
  };

  if (loading) return <LoadingComponent text={"Please Wait"} />;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-[460px] mx-auto shadow-xl border-slate-200/60 rounded-2xl p-5">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 mb-2">
            <UserOutlined className="text-lg" />
          </div>
          <Title level={4} className="!mb-0.5 !font-bold tracking-tight">
            Welcome Back
          </Title>
          <Text type="secondary" className="text-xs">
            Sign in to your account
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onLoginSubmit}
          requiredMark={false}
          className="w-full"
        >
          <Form.Item
            label={
              <span className="text-xs font-medium text-slate-600">
                Username
              </span>
            }
            name="username"
            rules={[{ required: true, message: "Username is required" }]}
            className="mb-4"
          >
            <Input
              prefix={<UserOutlined className="text-slate-400" />}
              placeholder="Enter your username"
              className="h-10 rounded-lg text-sm"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-medium text-slate-600">
                Password
              </span>
            }
            name="password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 3, message: "Password must be at least 3 characters" },
            ]}
            className="mb-5"
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="Enter your password"
              className="h-10 rounded-lg text-sm"
            />
          </Form.Item>

          <Form.Item className="mb-2">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              className="h-10 rounded-lg font-medium text-sm shadow-sm bg-blue-600 hover:bg-blue-500"
            >
              Sign In
            </Button>
          </Form.Item>

          <div className="text-center mt-4 text-xs">
            <Text type="secondary">Don’t have an account? </Text>
            <Button
              type="link"
              className="p-0 text-xs font-semibold text-blue-600 hover:text-blue-500"
              onClick={() => navigate("/sign-up")}
            >
              Sign Up
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;
