import {
  ClearOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  PhoneOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import {
  Avatar,
  Button,
  Card,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";
import "../css/Common.css";
import { SEARCH_VISITOR } from "../graphQl/queries";

const { Title, Text } = Typography;

function SearchPage() {
  const navigate = useNavigate();

  const [formFilter, setFormFilter] = useState({
    filterKey: "visitorName",
    filterValue: "",
  });

  const [activeFilters, setActiveFilter] = useState({
    visitorName: undefined,
    visitorContact: undefined,
    visitorAddress: undefined,
    visitorChildrenName: undefined,
  });

  const [pagination, setPagination] = useState({
    pageNo: 0,
    pageSize: 8,
    sortBy: "visitorName",
    sortOrder: "ASC",
  });

  const { data, loading } = useQuery(SEARCH_VISITOR, {
    variables: {
      filter: {
        visitorName: activeFilters.visitorName || undefined,
        visitorContact: activeFilters.visitorContact || undefined,
        visitorAddress: activeFilters.visitorAddress || undefined,
        visitorChildrenName: activeFilters.visitorChildrenName || undefined,
      },
      pagination: {
        pageNo: pagination.pageNo,
        pageSize: pagination.pageSize,
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const searchResult = data?.searchVisitor || { data: [], totalData: 0 };

  const handleSearchSubmit = () => {
    const rawVal = formFilter.filterValue.trim();

    const freshFilterPayload = {
      visitorName: undefined,
      visitorContact: undefined,
      visitorAddress: undefined,
      visitorChildrenName: undefined,
    };

    if (rawVal) {
      freshFilterPayload[formFilter.filterKey] = rawVal;
    }

    setActiveFilter(freshFilterPayload);
    setPagination((prev) => ({ ...prev, pageNo: 0 }));
  };

  const handleClearFilters = () => {
    setFormFilter({ filterKey: "visitorName", filterValue: "" });
    setActiveFilter({
      visitorName: undefined,
      visitorContact: undefined,
      visitorAddress: undefined,
      visitorChildrenName: undefined,
    });
    setPagination((prev) => ({ ...prev, pageNo: 0 }));
  };

  const columns = [
    {
      title: "Visitor Details",
      key: "visitorIdentity",
      render: (_, record) => (
        <Space size="middle" className="py-1">
          <Avatar
            src={
              record.visitorImage
                ? `http://localhost:8080/api/v1/file/image-by-name/${record.visitorImage}`
                : undefined
            }
            icon={<UserOutlined />}
            size={42}
            className="border border-slate-200/80 shadow-sm"
          />
          <div className="flex flex-col">
            <Text className="font-bold text-slate-800 text-sm tracking-tight">
              {record.visitorName}
            </Text>
            <Text
              type="secondary"
              className="text-xs font-mono flex items-center gap-1 mt-0.5"
            >
              <PhoneOutlined className="text-[10px]" />{" "}
              {record.visitorContact || "No Contact info"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Address Details",
      dataIndex: "visitorAddress",
      key: "visitorAddress",
      render: (addr) => (
        <div className="flex flex-col max-w-[220px]">
          <Text className="text-xs text-slate-700 font-medium truncate">
            <EnvironmentOutlined className="mr-1 text-slate-400" />
            {addr?.line1 || "No Street Location Specified"}
          </Text>
          <Text type="secondary" className="text-[11px] pl-3.5">
            {addr
              ? `${addr.city || ""}, ${addr.state || ""}`
              : "Missing Profile Coordinates"}
          </Text>
        </div>
      ),
    },
    {
      title: "Associated Wards",
      dataIndex: "hasChildrenInSchool",
      key: "hasChildrenInSchool",
      render: (hasChildren, record) => (
        <div className="flex flex-col gap-0.5">
          <Tag
            color={hasChildren ? "purple" : "default"}
            className="font-bold text-[9px] uppercase max-w-fit rounded-md"
          >
            {hasChildren ? "Parent/Guardian" : "External Visitor"}
          </Tag>
          {hasChildren && record.visitorChildren?.length > 0 && (
            <Text
              type="secondary"
              className="text-[11px] font-medium text-slate-500 max-w-[150px] truncate mt-0.5"
            >
              {record.visitorChildren[0].name} {"."}
              {record.visitorChildren[0].standard}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Security Clearance",
      dataIndex: "banStatus",
      key: "banStatus",
      render: (ban) => {
        const isBanned = ban?.isVisitorBanned;
        return (
          <Tooltip
            title={
              isBanned
                ? `Reason: ${ban.reason}`
                : "Cleared Profile Verification"
            }
          >
            <Tag
              color={isBanned ? "error" : "success"}
              className="font-extrabold px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase cursor-help"
            >
              {isBanned ? "Banned" : "Allowed"}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Tooltip title="Examine Registry Profile">
          <Button
            type="primary"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/visitor-profile/${record.id}`)}
            className="bg-blue-600 hover:bg-blue-500 border-none shadow-sm flex items-center justify-center mx-auto"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 font-sans select-none">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <Title
              level={4}
              className="!m-0 !font-bold text-slate-800 tracking-tight"
            >
              Visitor Search
            </Title>
            <Text type="secondary" className="text-xs">
              Find visitor records quickly using multiple search criteria.
            </Text>
          </div>
          {loading && (
            <Text className="text-xs font-semibold text-blue-600 animate-pulse">
              Searching...
            </Text>
          )}
        </div>

        <Card
          className="shadow-sm border-slate-200/80 rounded-xl"
          bodyStyle={{ padding: "14px" }}
        >
          <div className="flex flex-col sm:flex-row items-stretch gap-2 max-w-2xl">
            <Input
              placeholder={`Search by visitor name, phone, address, or student...`}
              value={formFilter.filterValue}
              onChange={(e) =>
                setFormFilter((prev) => ({
                  ...prev,
                  filterValue: e.target.value,
                }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              className="h-10 text-sm rounded-lg pr-1"
              allowClear
              addonBefore={
                <Select
                  value={formFilter.filterKey}
                  onChange={(val) =>
                    setFormFilter((prev) => ({ ...prev, filterKey: val }))
                  }
                  className="w-36 text-xs font-bold border-none text-slate-700"
                  options={[
                    { value: "visitorName", label: "Visitor Name" },
                    { value: "visitorContact", label: "Contact Phone" },
                    { value: "visitorAddress", label: "Address Line" },
                    { value: "visitorChildrenName", label: "Child/Ward Name" },
                  ]}
                />
              }
            />

            <div className="flex gap-1.5">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearchSubmit}
                loading={loading}
                className="h-7 px-5 font-semibold text-sm rounded-lg bg-blue-600 hover:bg-blue-500 border-none shadow-sm"
              >
                Search
              </Button>
              <Button
                type="text"
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
                className="h-7 text-slate-500 hover:bg-slate-100 font-medium text-xs rounded-lg flex items-center justify-center"
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="bg-slate-50/70 px-4 py-2 border-b border-slate-200/60 flex items-center justify-between">
            <Text type="secondary" className="text-[11px] font-semibold">
              Total Found Record:{" "}
              <span className="text-blue-600 font-bold font-mono">
                {searchResult.totalData}
              </span>
            </Text>
          </div>

          <Table
            dataSource={searchResult.data}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.pageNo + 1,
              pageSize: pagination.pageSize,
              total: searchResult.totalData,
              showSizeChanger: true,
              pageSizeOptions: ["8", "15", "30", "50"],
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

export default SearchPage;
