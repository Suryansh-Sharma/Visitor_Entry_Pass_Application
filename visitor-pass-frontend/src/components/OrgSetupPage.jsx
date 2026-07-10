import { BankOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { Button, Card, Form, Input, Typography } from "antd";
import { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { VisitorEntryPassContext } from "../context/VisitorEntryPassContext";
import { UPDATE_ORGANIZATION } from "../graphQl/queries";
import { LoadingComponent } from "./LoadingComponent";

const { Title, Text } = Typography;

function OrgSetupPage() {
  const { refetchOrganization } = useContext(VisitorEntryPassContext);
  const [form] = Form.useForm();

  const [updateOrganization, { loading }] = useMutation(UPDATE_ORGANIZATION, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    document.title = "Set Up Your Organization";
  }, []);

  const onSubmit = async (values) => {
    try {
      await updateOrganization({ variables: { input: values } });
      await refetchOrganization();
      toast.success("Organization details saved");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Unable to save organization details");
    }
  };

  if (loading) return <LoadingComponent text={"Saving organization details..."} />;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-[520px] mx-auto shadow-xl border-slate-200/60 rounded-2xl p-5">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 mb-2">
            <BankOutlined className="text-lg" />
          </div>
          <Title level={4} className="!mb-0.5 !font-bold tracking-tight">
            Welcome! Let's set up your organization
          </Title>
          <Text type="secondary" className="text-xs">
            This only needs to be done once. You can update it later from the
            Organization page.
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          requiredMark={false}
        >
          <Form.Item
            label="Organization Name"
            name="organizationName"
            rules={[{ required: true, message: "Organization name is required" }]}
          >
            <Input placeholder="e.g., ABC Public School" className="h-10 rounded-lg text-sm" />
          </Form.Item>

          <Form.Item label="Organization Type" name="organizationType">
            <Input placeholder="e.g., School, Office, Hospital" className="h-10 rounded-lg text-sm" />
          </Form.Item>

          <Form.Item label="Address" name="organizationAddress">
            <Input placeholder="Address" className="h-10 rounded-lg text-sm" />
          </Form.Item>

          <Form.Item label="Phone" name="organizationPhone">
            <Input placeholder="Contact number" className="h-10 rounded-lg text-sm" />
          </Form.Item>

          <Form.Item label="Email" name="organizationEmail">
            <Input placeholder="Contact email" className="h-10 rounded-lg text-sm" />
          </Form.Item>

          <Form.Item className="mb-1">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              className="h-10 rounded-lg font-medium text-sm shadow-sm bg-blue-600 hover:bg-blue-500"
            >
              Save & Continue
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default OrgSetupPage;
