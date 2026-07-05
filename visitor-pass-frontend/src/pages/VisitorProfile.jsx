import {
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  IdcardOutlined,
  PhoneOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Divider,
  List,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router";
import { LoadingComponent } from "../components/LoadingComponent";
import {
  GET_VISITOR_BY_ID,
  SEARCH_VISITS,
  SEARCH_VISITS_OF_VISITOR,
} from "../graphQl/queries";
import { useState } from "react";

const { Title, Text } = Typography;

function VisitorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: userData, loading: userLoading } = useQuery(GET_VISITOR_BY_ID, {
    variables: { visitorId: id },
    fetchPolicy: "cache-and-network",
  });

  const [pagination, setPagination] = useState({
    pageNo: 0,
    pageSize: 10,
    sortBy: "visitedOn",
    sortOrder: "DESC",
  });
  const { data: visitData, loading: visitLoading } = useQuery(
    SEARCH_VISITS_OF_VISITOR,
    {
      variables: {
        filter: {
          visitorId: id,
        },
        pagination: {
          pageNo: pagination.pageNo,
          pageSize: pagination.pageSize,
          sortBy: pagination.sortBy,
          sortOrder: pagination.sortOrder,
        },
      },
      fetchPolicy: "cache-and-network",
    },
  );

  const result = userData?.getVisitorById ?? {
    visitorContact: "",
    visitorName: "",
    visitorImage: "",
    banStatus: null,
    visitorAddress: {
      city: "",
      line1: "",
      pinCode: "",
    },
    hasChildrenInSchool: false,
    visitorChildren: [],
  };

  const visitPagingData = visitData?.visits || {
    data: [],
    totalData: 0,
    pageNo: 0,
    pageSize: 0,
  };
  const columns = [
    {
      title: "Host Target",
      dataIndex: "visitorHost",
      key: "visitorHost",
      render: (host) => (
        <Text className="text-slate-700 font-medium text-sm">
          {host || "N/A"}
        </Text>
      ),
    },
    {
      title: "Visited On",
      dataIndex: "visitedOn",
      key: "visitedOn",
      sorter: true,
      render: (date) => (
        <Text className="text-slate-600 text-xs font-medium">
          <CalendarOutlined className="mr-1 text-slate-400" />
          {date
            ? new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })
            : "N/A"}
        </Text>
      ),
    },
    {
      title: "Reason / Purpose",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      render: (reason) => (
        <Text type="secondary" className="text-xs">
          {reason || "No Reason Specified"}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "PENDING") color = "warning";
        if (status === "ACCEPTED" || status === "COMPLETED") color = "success";
        if (status === "REJECTED") color = "error";
        return (
          <Tag
            color={color}
            className="font-bold px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase"
          >
            {status || "UNKNOWN"}
          </Tag>
        );
      },
    },
  ];

  if (userLoading) {
    return (
      <LoadingComponent text={"Please Wait, Visitor Profile is Loading"} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 font-sans select-none">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => navigate(`/update-visitor-profile/${id}`)}
            className="border-slate-300 rounded-lg h-9 font-medium text-xs text-slate-700"
          >
            Modify Profile
          </Button>
        </div>

        <Card
          className="shadow-sm border-slate-200 rounded-2xl overflow-hidden"
          bodyStyle={{ padding: "24px" }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <Avatar
              src={
                result.visitorImage
                  ? `http://localhost:8080/api/v1/file/image-by-name/${result.visitorImage}`
                  : undefined
              }
              icon={<UserOutlined />}
              size={110}
              className="border-4 border-slate-100"
            />
            <div className="space-y-2 flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <Title
                  level={3}
                  className="!m-0 !font-extrabold text-slate-800 tracking-tight"
                >
                  {result.visitorName || "Unregistered Account"}
                </Title>
                <Tag
                  color={result.banStatus ? "error" : "success"}
                  icon={
                    result.banStatus ? (
                      <WarningOutlined />
                    ) : (
                      <CheckCircleOutlined />
                    )
                  }
                  className="font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider self-center"
                >
                  {result.banStatus
                    ? "Banned Gate Access"
                    : "Authorized Active"}
                </Tag>
              </div>
              <div className="space-y-1 text-xs text-slate-500 font-medium">
                <p className="flex items-center justify-center sm:justify-start gap-1.5">
                  <PhoneOutlined className="text-slate-400" />{" "}
                  {result.visitorContact || "No Telephone Context Index"}
                </p>
                <p className="flex items-center justify-center sm:justify-start gap-1.5">
                  <EnvironmentOutlined className="text-slate-400" />
                  {result.visitorAddress?.line1 ? (
                    <span>
                      {result.visitorAddress.line1},{" "}
                      {result.visitorAddress.city} -{" "}
                      {result.visitorAddress.pinCode}
                    </span>
                  ) : (
                    "No Address Listed Fields"
                  )}
                </p>
              </div>
            </div>
          </div>
          {result.banStatus && (
            <Alert
              message={
                <span className="font-bold text-red-800 text-xs">
                  Security System Ban Directive Lockout
                </span>
              }
              description={
                <div className="text-xs text-red-700 font-medium space-y-1 mt-0.5">
                  <p>
                    <strong>Reason Parameters:</strong>{" "}
                    {result.banStatus?.reason ||
                      "Violations of systemic workspace protocols."}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] font-mono text-red-600">
                    <CalendarOutlined /> Imposed Timeline:{" "}
                    {result.banStatus?.bannedOn
                      ? dayjs(result.banStatus.bannedOn).format("MMMM DD, YYYY")
                      : "N/A"}
                  </p>
                </div>
              }
              type="error"
              showIcon
              className="mt-5 rounded-xl border border-red-200/60 shadow-inner bg-red-50/50"
            />
          )}
          <Divider className="border-slate-100 my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-700">
                <IdcardOutlined className="text-blue-500 text-sm" />
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Registry Affiliations
                </span>
              </div>

              <Card
                className="bg-slate-50/70 border-slate-200/50 rounded-xl"
                bodyStyle={{ padding: "16px" }}
              >
                <Descriptions column={1} layout="horizontal" size="small">
                  <Descriptions.Item
                    label={
                      <span className="text-xs font-semibold text-slate-500">
                        School Affiliation
                      </span>
                    }
                  >
                    <Tag
                      color={result.hasChildrenInSchool ? "purple" : "default"}
                      className="font-bold text-[9px] uppercase rounded-md m-0"
                    >
                      {result.hasChildrenInSchool
                        ? "Parent / Guardian"
                        : "External Visitor"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-700">
                <UserOutlined className="text-purple-500 text-sm" />
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Registered Wards / Children
                </span>
              </div>

              {result.hasChildrenInSchool &&
              result.visitorChildren?.length > 0 ? (
                <List
                  size="small"
                  className="bg-slate-50/70 border border-slate-200/50 rounded-xl px-2 py-1 shadow-inner"
                  dataSource={result.visitorChildren}
                  renderItem={(child) => (
                    <List.Item className="!border-slate-200/40 py-2 flex justify-between items-center">
                      <Space size="small">
                        <span className="text-slate-400 text-[10px]">👦</span>
                        <Text className="font-semibold text-slate-700 text-xs">
                          {child.name}
                        </Text>
                      </Space>
                      <Tag
                        color="blue"
                        className="font-bold text-[9px] m-0 rounded-md uppercase tracking-wide"
                      >
                        Standard {child.standard}
                      </Tag>
                    </List.Item>
                  )}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50/40 border border-dashed border-slate-200 rounded-xl text-center h-8">
                  <Text
                    type="secondary"
                    className="text-xs font-medium italic text-slate-400"
                  >
                    No active student record links mapped to this profile.
                  </Text>
                </div>
              )}
            </div>
          </div>
        </Card>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <Table
            dataSource={visitPagingData.data}
            columns={columns}
            rowKey="id"
            loading={visitLoading}
            pagination={{
              current: pagination.pageNo + 1,
              pageSize: pagination.pageSize,
              total: visitPagingData.totalData,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              onChange: (page, size) => {
                setPagination((prev) => ({
                  ...prev,
                  pageNo: page - 1,
                  pageSize: size,
                }));
              },
            }}
            onChange={(_, __, sorter) => {
              if (sorter.field) {
                setPagination((prev) => ({
                  ...prev,
                  sortBy: sorter.field,
                  sortOrder: sorter.order === "ascend" ? "ASC" : "DESC",
                }));
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default VisitorProfile;
