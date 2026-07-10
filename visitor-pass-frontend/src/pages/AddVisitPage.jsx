import { useLazyQuery, useMutation, useApolloClient } from "@apollo/client";
import {
  DeleteOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
  SaveOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Select,
  Typography,
  Space,
} from "antd";
import axios from "axios";
import { useContext, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { VisitorEntryPassContext } from "../context/VisitorEntryPassContext";
import CameraCaptureComponent from "../components/CameraCaptureComponent";
import { GET_VISITOR_BY_CONTACT, ADD_NEW_VISIT } from "../graphQl/queries";
import { LoadingComponent } from "../components/LoadingComponent";

const { Title, Text } = Typography;
const { TextArea } = Input;
const MySwal = withReactContent(Swal);

function AddVisitPage() {
  const { allTelegramIds } = useContext(VisitorEntryPassContext);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const client = useApolloClient();
  const debounceRef = useRef(null);

  // --- CORE SYSTEM STATE REGISTRIES ---
  const [visitorData, setVisitorData] = useState({ visitorChildren: null });
  const [visitorProfile, setVisitorProfile] = useState(null);
  const [visitorFound, setVisitorFound] = useState(false);
  const [showVisitorForm, setShowVisitorForm] = useState(true);
  const [showImageSec, setShowImageSec] = useState(true);
  // Camera stays unmounted (no live video feed running) until the contact
  // number is fully entered — starting the webcam eagerly on page load makes
  // typing feel laggy since a continuous 720p decode competes for the main thread.
  const [cameraEnabled, setCameraEnabled] = useState(false);

  // --- LIVE GRAPHQL OPERATIONS ---
  const [searchVisitor, { loading: searchingVisitor }] = useLazyQuery(
    GET_VISITOR_BY_CONTACT,
    {
      fetchPolicy: "network-only",
      onCompleted: ({ getVisitorByContact }) => {
        // 💡 Defer state adjustments outside the synchronous lifecycle execution pass
        setTimeout(() => {
          if (getVisitorByContact) {
            setVisitorFound(true);
            setVisitorProfile(getVisitorByContact);

            form.setFieldsValue({
              visitorContact: getVisitorByContact.visitorContact,
              visitorName: getVisitorByContact.visitorName,
              visitorImage: getVisitorByContact.visitorImage,
              city: getVisitorByContact.visitorAddress?.city || "Bulandshahr",
              line1: getVisitorByContact.visitorAddress?.line1 || "",
              pinCode: getVisitorByContact.visitorAddress?.pinCode || "203001",
              hasChildrenInSchool: getVisitorByContact.hasChildrenInSchool,
              visitorChildren: getVisitorByContact.visitorChildren || [],
            });

            setVisitorData({
              visitorChildren: getVisitorByContact.hasChildrenInSchool
                ? getVisitorByContact.visitorChildren || []
                : null,
            });

            setShowVisitorForm(false);
            setShowImageSec(false);
            toast.success(
              `Profile located: ${getVisitorByContact.visitorName}`,
            );
          } else {
            resetVisitorStates(form.getFieldValue("visitorContact"));
          }
        }, 0);
      },
      onError: (err) => {
        console.error(err);
        setTimeout(() => {
          resetVisitorStates(form.getFieldValue("visitorContact"));
        }, 0);
      },
    },
  );

  const [addNewVisitApi, { loading: addVisitLoading }] = useMutation(
    ADD_NEW_VISIT,
    {
      fetchPolicy: "no-cache",
    },
  );

  const resetVisitorStates = (contactValue) => {
    setVisitorFound(false);
    setVisitorProfile(null);
    setShowVisitorForm(true);
    setShowImageSec(true);
    setVisitorData({ visitorChildren: null });

    form.resetFields([
      "visitorName",
      "visitorImage",
      "city",
      "line1",
      "pinCode",
      "hasChildrenInSchool",
      "visitorChildren",
    ]);
    form.setFieldsValue({
      city: "Bulandshahr",
      pinCode: "203001",
      visitorContact: contactValue,
    });
  };

  const handleContactChange = (e) => {
    const phone = e.target.value.replace(/\D/g, "");
    form.setFieldsValue({ visitorContact: phone });

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (phone.length !== 10) {
      setVisitorFound(false);
      setVisitorProfile(null);
      setShowVisitorForm(false);
      setCameraEnabled(false);
      return;
    }

    setCameraEnabled(true);
    debounceRef.current = setTimeout(() => {
      searchVisitor({
        variables: { visitorContact: phone },
      });
    }, 500);
  };

  const handleClearForm = () => {
    form.resetFields();
    resetVisitorStates("");
    setCameraEnabled(false);
  };

  const onFinishSubmit = async (values) => {
    if (visitorProfile?.banStatus?.isVisitorBanned) {
      MySwal.fire({
        title: "Access Banned",
        text: `Visitor is flagged in the system database records. Reason: ${visitorProfile.banStatus.reason}`,
        icon: "error",
      });
      return;
    }

    const confirmAction = await MySwal.fire({
      title: "Confirm Log Entry?",
      text: "Commit this visitor authorization entry sequence?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Execute",
      confirmButtonColor: "#2563eb",
    });

    if (!confirmAction.isConfirmed) return;

    try {
      let finalImageFilename =
        values.visitorImage || visitorProfile?.visitorImage || "default-visitor.png";

      // A fresh camera capture arrives as a base64 data URL — it must be uploaded
      // to the backend's image storage first; the visit record only stores a filename.
      if (finalImageFilename.startsWith("data:")) {
        const generatedFilename = `${new Date().toISOString().replace(/[:.]/g, "-")}.jpg`;
        const base64Buffer = finalImageFilename.split(",")[1];
        const blob = new Blob(
          [Uint8Array.from(atob(base64Buffer), (c) => c.charCodeAt(0))],
          { type: "image/jpeg" },
        );

        const fileUploadPayload = new FormData();
        fileUploadPayload.append("image", blob, generatedFilename);

        await axios.post(
          `http://localhost:8080/api/v1/file/new-image/${generatedFilename}`,
          fileUploadPayload,
        );
        finalImageFilename = generatedFilename;
      }

      const visitInputPayload = {
        visitorContact: values.visitorContact,
        visitorName: values.visitorName,
        visitorImage: finalImageFilename,
        visitorAddress: {
          city: values.city,
          line1: values.line1,
          pinCode: values.pinCode,
        },
        visitorChildren: (values.visitorChildren || []).map((c) => ({
          name: c.name,
          standard: c.standard,
        })),
        visitingRecord: {
          reason: values.reason,
          visitorHost: values.visitorHost,
          status: "PENDING",
        },
      };

      await addNewVisitApi({ variables: { input: visitInputPayload } });

      MySwal.fire("Success", "Visit logged into secure registry.", "success");
      handleClearForm();
      client.resetStore();
    } catch (err) {
      MySwal.fire(
        "Execution Error",
        err.message || "Failed to commit logs.",
        "error",
      );
    }
  };

  if (searchingVisitor || addVisitLoading) return <LoadingComponent />;

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 font-sans select-none">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* BRANDING HEADER HEADER */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <Title
              level={4}
              className="!m-0 !font-bold text-slate-800 tracking-tight"
            >
              Add New Visit
            </Title>
            <Text type="secondary" className="text-xs">
              Add new visits for new and existing visitors.
            </Text>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishSubmit}
          requiredMark={false}
          className="space-y-4"
        >
          {/* VISITOR INFO CARD */}
          <Card
            className="shadow-sm border-slate-200/80 rounded-xl"
            title={
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visitor Information
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Visitor Contact"
                name="visitorContact"
                rules={[
                  { required: true, message: "Required" },
                  { len: 10, message: "Must be 10 digits" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-slate-400" />}
                  placeholder="10-digit smartphone index"
                  onChange={handleContactChange}
                  className="h-10 rounded-lg text-sm"
                />
              </Form.Item>

              <Form.Item
                label="Visitor Full Name"
                name="visitorName"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400" />}
                  placeholder="Legal name credentials"
                  className="h-10 rounded-lg text-sm"
                  disabled={visitorFound && !showVisitorForm}
                />
              </Form.Item>
            </div>
          </Card>

          {/* VISITOR ADDRESS INFORMATION CARD */}
          <Card
            className="shadow-sm border-slate-200/80 rounded-xl"
            title={
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visitor Address Information
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                label="Location Information"
                name="line1"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input
                  prefix={<EnvironmentOutlined className="text-slate-400" />}
                  placeholder="Building, Block, Area"
                  className="h-10 rounded-lg text-sm"
                  disabled={visitorFound && !showVisitorForm}
                />
              </Form.Item>

              <Form.Item
                label="City"
                name="city"
                initialValue="Bulandshahr"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input
                  placeholder="City"
                  className="h-10 rounded-lg text-sm"
                  disabled={visitorFound && !showVisitorForm}
                />
              </Form.Item>

              <Form.Item
                label="Postal/Pin Code"
                name="pinCode"
                initialValue="203001"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input
                  placeholder="Pin Code"
                  className="h-10 rounded-lg text-sm"
                  disabled={visitorFound && !showVisitorForm}
                />
              </Form.Item>
            </div>
          </Card>

          {/* SCHOOL CHILDREN SECTION CARD */}
          <Card className="shadow-sm border-slate-200/80 rounded-xl">
            <Form.Item
              name="hasChildrenInSchool"
              valuePropName="checked"
              className="mb-0"
            >
              <Checkbox
                disabled={visitorFound && !showVisitorForm}
                onChange={(e) => {
                  if (e.target.checked) {
                    setVisitorData({ visitorChildren: [] });
                  } else {
                    setVisitorData({ visitorChildren: null });
                    form.setFieldsValue({ visitorChildren: [] });
                  }
                }}
                className="text-xs font-semibold text-slate-600"
              >
                Subject acts as Parent / Guardian to currently active
                institutional students
              </Checkbox>
            </Form.Item>

            {visitorData.visitorChildren !== null && (
              <div className="mt-4 border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <Form.List name="visitorChildren">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field) => {
                        // 💡 Fix parsing error: Extract the dynamic fields cleanly inside the body mapping
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
                                disabled={visitorFound && !showVisitorForm}
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
                                disabled={visitorFound && !showVisitorForm}
                                options={[
                                  {
                                    label: "Kindergarten (JKG/SKG/UKG)",
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
                                    label: "Higher Secondary",
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
                            {!visitorFound && (
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                                className="h-10 flex items-center justify-center rounded-lg hover:bg-red-50"
                              />
                            )}
                          </div>
                        );
                      })}
                      {!visitorFound && (
                        <Button
                          type="dashed"
                          block
                          onClick={() => add()}
                          icon={<PlusOutlined />}
                          className="h-10 rounded-lg text-xs font-semibold text-blue-600 border-blue-200 hover:border-blue-300"
                        >
                          Add Children
                        </Button>
                      )}
                    </>
                  )}
                </Form.List>
              </div>
            )}
          </Card>

          {/* VISITING LOG ENTRIES DETAILS CARD */}
          <Card
            className="shadow-sm border-slate-200/80 rounded-xl"
            title={
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visiting Host Parameters
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <Form.Item
                label="Whom Visitor Wants To Visit"
                name="visitorHost"
                rules={[{ required: true, message: "Required" }]}
                className="md:col-span-1"
              >
                <Select
                  placeholder="Select Host"
                  className="h-10 text-sm"
                  dropdownClassName="rounded-xl shadow-lg"
                  options={allTelegramIds.map((t) => ({
                    value: t.hostName,
                    label: (
                      <div className="flex flex-col py-0.5 text-xs">
                        <span className="font-bold text-slate-800 text-xs">
                          {t.hostName}
                        </span>
                        <span className="text-slate-400 text-[10px] mt-0.5">
                          Role: {t.role}
                        </span>
                      </div>
                    ),
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Explicit Purpose Description"
                name="reason"
                rules={[{ required: true, message: "Required" }]}
                className="md:col-span-2"
              >
                <TextArea
                  rows={2}
                  placeholder="Log entries rationale justification"
                  className="rounded-lg text-sm border-slate-300 py-2"
                />
              </Form.Item>
            </div>
          </Card>

          {/* CAMERA COMPONENT CONTAINER */}
          {(!visitorFound || showImageSec) &&
            (cameraEnabled ? (
              <Card
                className="shadow-sm border-slate-200/80 rounded-xl"
                title={
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Visitor Photograph Verification
                  </span>
                }
              >
                <Form.Item
                  name="visitorImage"
                  valuePropName="value"
                  rules={[
                    {
                      required: true,
                      message: "Please capture the visitor photograph.",
                    },
                  ]}
                >
                  <CameraCaptureComponent
                    disabled={visitorFound && !showImageSec}
                  />
                </Form.Item>
              </Card>
            ) : (
              <Card className="shadow-sm border-slate-200/80 rounded-xl border-dashed">
                <Text type="secondary" className="text-xs italic">
                  Enter a complete 10-digit contact number to enable the
                  camera for photograph capture.
                </Text>
              </Card>
            ))}

          {/* OPERATIONAL DISPATCH ACTIONS HUB PANEL */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto pt-2">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SaveOutlined />}
              block
              className="bg-emerald-600 hover:bg-emerald-500 border-none shadow-md shadow-emerald-100 rounded-xl font-bold text-sm h-11"
            >
              Log Entry
            </Button>
            <Button
              type="text"
              size="large"
              icon={<ClearOutlined />}
              block
              onClick={handleClearForm}
              className="text-slate-500 hover:bg-slate-100 font-bold text-sm h-11 rounded-xl"
            >
              Clear Fields
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default AddVisitPage;
