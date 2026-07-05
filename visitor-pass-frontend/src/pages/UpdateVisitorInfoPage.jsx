import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PlusOutlined,
  SaveOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  Select,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import CameraCaptureComponent from "../components/CameraCaptureComponent";
import { LoadingComponent } from "../components/LoadingComponent";
import { GET_VISITOR_BY_ID, UPDATE_VISITOR } from "../graphQl/queries";

const { Title, Text } = Typography;
const { TextArea } = Input;
const MySwal = withReactContent(Swal);

function UpdateVisitorInfoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // --- CORE SYSTEM STATE CONTROLLERS ---
  const [hasChildren, setHasChildren] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // --- LIVE GRAPHQL LIFECYCLES ---
  const [getVisitorById, { loading: fetchLoading }] = useLazyQuery(
    GET_VISITOR_BY_ID,
    {
      fetchPolicy: "network-only",
      onCompleted: ({ getVisitorById }) => {
        // Defer form population safely outside synchronous mounting loops
        setTimeout(() => {
          if (getVisitorById) {
            sessionStorage.setItem(id, JSON.stringify(getVisitorById));
            hydrateFormInstance(getVisitorById);
          } else {
            navigate("/");
          }
        }, 0);
      },
      onError: (err) => {
        console.error("Failed to load historical database profile node:", err);
        navigate("/");
      },
    },
  );

  const [updateVisitorInfoApi, { loading: mutationLoading }] = useMutation(
    UPDATE_VISITOR,
    {
      fetchPolicy: "no-cache",
    },
  );

  // Dual caching pipeline loader initializer check
  useEffect(() => {
    document.title = "Update Profile Registry";
    const localCachedCopy = sessionStorage.getItem(id);

    if (localCachedCopy) {
      try {
        const parsedData = JSON.parse(localCachedCopy);
        hydrateFormInstance(parsedData);
      } catch (e) {
        getVisitorById({ variables: { visitorId: id } });
      }
    } else {
      getVisitorById({ variables: { visitorId: id } });
    }
  }, [id, getVisitorById]);

  const hydrateFormInstance = (data) => {
    setHasChildren(data.hasChildrenInSchool || false);
    setIsBanned(data.banStatus?.isVisitorBanned || false);

    form.setFieldsValue({
      visitorContact: data.visitorContact,
      visitorName: data.visitorName,
      line1: data.visitorAddress?.line1 || "",
      city: data.visitorAddress?.city || "Bulandshahr",
      pinCode: data.visitorAddress?.pinCode || "203001",
      hasChildrenInSchool: data.hasChildrenInSchool || false,
      visitorChildren: data.visitorChildren || [],
      visitorImage: data.visitorImage || "",
      banReason: data.banStatus?.reason || "",
    });
    setInitialLoading(false);
  };

  // --- CORE SUBMIT DATA PERSISTENCE ACTION PIPELINE ---
  const onFinishSubmit = async (values) => {
    const confirmAction = await MySwal.fire({
      title: "Commit Profile Modifications?",
      text: "Overwrite historical profile metadata parameters inside master cloud log arrays?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Commit Alteration",
      confirmButtonColor: "#2563eb",
    });

    if (!confirmAction.isConfirmed) return;

    try {
      let finalImageFilename = values.visitorImage;

      // Check if image variable is a fresh camera snapshot base64 capture block string buffer array
      if (values.visitorImage && values.visitorImage.startsWith("data:")) {
        const generatedFilename = `${new Date().toISOString().replace(/[:.]/g, "-")}.jpg`;
        const base64Buffer = values.visitorImage.split(",")[1];
        const blob = new Blob(
          [Uint8Array.from(atob(base64Buffer), (c) => c.charCodeAt(0))],
          { type: "image/jpeg" },
        );

        const fileUploadPayload = new FormData();
        fileUploadPayload.append("image", blob, generatedFilename);

        // Upload new snapshot to storage pipeline array routing
        await axios.post(
          `http://localhost:8080/api/v1/file/new-image/${generatedFilename}`,
          fileUploadPayload,
        );
        finalImageFilename = generatedFilename;
      }

      const updatePayloadInput = {
        id: id,
        visitorContact: values.visitorContact,
        visitorName: values.visitorName,
        visitorImage: finalImageFilename,
        hasChildrenInSchool: values.hasChildrenInSchool || false,
        visitorAddress: {
          city: values.city,
          line1: values.line1,
          pinCode: values.pinCode,
        },
        visitorChildren: values.hasChildrenInSchool
          ? (values.visitorChildren || []).map((c) => ({
              name: c.name,
              standard: c.standard,
            }))
          : null,
        banStatus: isBanned
          ? { isVisitorBanned: true, reason: values.banReason }
          : null,
      };
      const response = await updateVisitorInfoApi({
        variables: { input: updatePayloadInput },
      });

      if (response.data?.updateVisitorInfo) {
        sessionStorage.setItem(
          id,
          JSON.stringify(response.data.updateVisitorInfo),
        );
        MySwal.fire(
          "Success",
          "Visitor profile updated successfully.",
          "success",
        ).then(() => navigate(-1));
      }
    } catch (err) {
      MySwal.fire(
        "Modification Failure",
        err.message || "GraphQL endpoint compilation fault.",
        "error",
      );
    }
  };

  if (fetchLoading || mutationLoading || initialLoading)
    return <LoadingComponent />;

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 font-sans select-none">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* NATIVE INTERACTION HEADER BAR */}
        <div className="flex items-center justify-between">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-600 font-medium hover:bg-slate-200/60 rounded-lg"
          >
            Cancel and Return
          </Button>
          <Title
            level={4}
            className="!m-0 !font-bold text-slate-800 tracking-tight"
          >
            Modify Registry Identity File
          </Title>
          <div className="w-24" /> {/* Flex layout spacing buffer */}
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishSubmit}
          requiredMark={false}
          className="space-y-4"
        >
          {/* CARD 1: PRIMARY METRICS */}
          <Card
            className="shadow-sm border-slate-200/80 rounded-xl"
            title={
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visitor Profile Coordinates
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Contact Registration Number"
                name="visitorContact"
                rules={[
                  { required: true, message: "Required" },
                  { len: 10, message: "Must be 10 digits" },
                ]}
              >
                <Input
                  disabled
                  prefix={<PhoneOutlined className="text-slate-400" />}
                  placeholder="10-digit smartphone mobile line"
                  className="h-10 rounded-lg text-sm"
                />
              </Form.Item>

              <Form.Item
                label="Visitor Full Name Credentials"
                name="visitorName"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400" />}
                  placeholder="Legal Identity"
                  className="h-10 rounded-lg text-sm"
                />
              </Form.Item>
            </div>
          </Card>

          {/* CARD 2: POSTAL ADRESS SETTINGS */}
          <Card
            className="shadow-sm border-slate-200/80 rounded-xl"
            title={
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Physical Location Coordinates
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                label="Street Address Frame (Line 1)"
                name="line1"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input
                  prefix={<EnvironmentOutlined className="text-slate-400" />}
                  placeholder="Building, Complex, Locality"
                  className="h-10 rounded-lg text-sm"
                />
              </Form.Item>

              <Form.Item
                label="City Location Node"
                name="city"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input placeholder="City" className="h-10 rounded-lg text-sm" />
              </Form.Item>

              <Form.Item
                label="Postal/Pin Code Index"
                name="pinCode"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input
                  placeholder="Postal Pin Index"
                  className="h-10 rounded-lg text-sm"
                />
              </Form.Item>
            </div>
          </Card>

          {/* CARD 3: INSTITUTIONAL GUARDIANSHIP CHANNELS */}
          <Card
            className="shadow-sm border-slate-200/80 rounded-xl"
            title={
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Institutional Linkage Matrix
              </span>
            }
          >
            <Form.Item
              name="hasChildrenInSchool"
              valuePropName="checked"
              className="mb-0"
            >
              <Checkbox
                onChange={(e) => setHasChildren(e.target.checked)}
                className="text-xs font-semibold text-slate-600"
              >
                Subject acts as Parent / Guardian to active school student
                groups
              </Checkbox>
            </Form.Item>

            {hasChildren && (
              <div className="mt-4 border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <Form.List name="visitorChildren">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field) => {
                        const { key, name, ...restField } = field;
                        return (
                          <div
                            key={key}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pb-2 border-b border-slate-200/40 last:border-0"
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "name"]}
                              rules={[{ required: true, message: "Required" }]}
                              className="!mb-0 flex-grow"
                            >
                              <Input
                                placeholder="Full Child Name"
                                className="h-10 rounded-lg text-sm"
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, "standard"]}
                              rules={[{ required: true, message: "Required" }]}
                              className="!mb-0 w-full sm:w-52"
                            >
                              <Select
                                placeholder="Select Standard"
                                className="h-10 text-sm"
                                options={[
                                  {
                                    label: "Kindergarten Lower Blocks",
                                    title: "Kindergarten",
                                    options: [
                                      { value: "JKG", label: "Junior KG" },
                                      { value: "SKG", label: "Senior KG" },
                                      { value: "UKG", label: "Upper KG" },
                                    ],
                                  },
                                  {
                                    label: "Standard Grades",
                                    title: "Standard Grades",
                                    options: Array.from(
                                      { length: 10 },
                                      (_, i) => ({
                                        value: String(i + 1),
                                        label: `Grade ${i + 1}`,
                                      }),
                                    ),
                                  },
                                  {
                                    label: "Higher Secondary Tracks",
                                    title: "Higher Secondary",
                                    options: [
                                      {
                                        value: "11 SCI",
                                        label: "11th Science",
                                      },
                                      {
                                        value: "11 COM",
                                        label: "11th Commerce",
                                      },
                                      {
                                        value: "12 SCI",
                                        label: "12th Science",
                                      },
                                      {
                                        value: "12 COM",
                                        label: "12th Commerce",
                                      },
                                    ],
                                  },
                                ]}
                              />
                            </Form.Item>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                              className="h-10 flex items-center justify-center rounded-lg hover:bg-red-50"
                            />
                          </div>
                        );
                      })}
                      <Button
                        type="dashed"
                        block
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                        className="h-10 rounded-lg text-xs font-semibold text-blue-600 border-blue-200 hover:border-blue-300"
                      >
                        Map Linked Ward Record Node
                      </Button>
                    </>
                  )}
                </Form.List>
              </div>
            )}
          </Card>

          {/* CARD 4: ADVANCED SECURITY FLAG PARAMETERS */}
          <Card
            className="shadow-sm border-slate-200/80 rounded-xl"
            title={
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Security Clearance Flag Configurations
              </span>
            }
          >
            <div className="space-y-4">
              <Checkbox
                checked={isBanned}
                onChange={(e) => setIsBanned(e.target.checked)}
                className="text-xs font-bold text-red-600 uppercase tracking-wide flex items-center gap-1"
              >
                <WarningOutlined /> Imposed System Database Ban Restrictive
                Directive
              </Checkbox>

              {isBanned && (
                <div className="space-y-2 max-w-xl transition-all duration-300">
                  <Alert
                    message="Advisory: Checking this flag activates instant lockout loops upon gateway scan lookup passes."
                    type="warning"
                    showIcon
                    className="rounded-lg text-xs font-medium py-1.5"
                  />
                  <Form.Item
                    label="Justification Narrative Rationale"
                    name="banReason"
                    rules={[
                      {
                        required: true,
                        message:
                          "A clear violation cause narrative is mandatory if flag is live.",
                      },
                    ]}
                  >
                    <TextArea
                      rows={2}
                      placeholder="Specify precise administrative reason context detailing terminal ban rules configurations..."
                      className="rounded-lg text-sm border-slate-300 py-2"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </Card>

          {/* CARD 5: INTEGRATED VIRTUAL SNAPHOT CAMERA MATRIX */}
          <Card
            className="shadow-sm border-slate-200/80 rounded-xl"
            title={
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Optical Verification Profile Asset Capture
              </span>
            }
          >
            <Form.Item
              name="visitorImage"
              valuePropName="value"
              rules={[
                {
                  required: true,
                  message: "Verification picture track mandatory.",
                },
              ]}
            >
              <CameraCaptureComponent />
            </Form.Item>
          </Card>

          <Divider className="border-slate-200/60 my-6" />

          {/* GLOBAL CARD SAVING CONTROL ROW ACTION HUD */}
          <div className="max-w-xs mx-auto">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SaveOutlined />}
              block
              className="bg-blue-600 hover:bg-blue-500 border-none shadow-md shadow-blue-100 rounded-xl font-bold text-sm h-11"
            >
              Commit Profile Changes
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default UpdateVisitorInfoPage;
