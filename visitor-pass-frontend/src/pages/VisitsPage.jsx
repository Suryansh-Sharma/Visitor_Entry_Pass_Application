import { useQuery } from "@apollo/client";
import { useState } from "react";
import { LoadingComponent } from "../components/LoadingComponent";
import { SEARCH_VISITS } from "../graphQl/queries";
import {
  Button,
  Card,
  DatePicker,
  Input,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import {
  CalendarOutlined,
  ClearOutlined,
  PhoneOutlined,
  SearchOutlined,
} from "@ant-design/icons";
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
function VisitsPage() {
  const todayDate = new Date().toISOString().split("T")[0];
  const [pagination, SetPagination] = useState({
    pageNo: 0,
    pageSize: 10,
    sortBy: "visitedOn",
    sortOrder: "DESC",
  });
  const [filters, SetFilters] = useState({
    visitorName: "",
    visitorContact: "",
    status: undefined,
    fromDate: todayDate,
    toDate: todayDate,
  });

  const { data, loading, error } = useQuery(SEARCH_VISITS, {
    variables: {
      filter: {
        visitorName: filters.visitorName.trim() || undefined,
        visitorContact: filters.visitorContact.trim() || undefined,
        status: filters.status || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
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
  const pagingData = data?.visits || {
    data: [],
    totalData: 0,
    pageNo: 0,
    pageSize: 0,
  };

  const handleFilterChange = (field, value) => {
    SetFilters((prev) => ({ ...prev, [field]: value }));
    SetPagination((prev) => ({ ...prev, pageNo: 0 }));
  };

  const handleDateRangeChange = (dates) => {
    SetFilters((prev) => ({
      ...prev,
      fromDate: dates ? dates[0].format("YYYY-MM-DD") : null,
      toDate: dates ? dates[1].format("YYYY-MM-DD") : null,
    }));
    SetPagination((prev) => ({ ...prev, pageNo: 0 }));
  };

  const resetAllFilters = () => {
    SetFilters({
      visitorName: "",
      visitorContact: "",
      status: undefined,
      fromDate: null,
      toDate: null,
    });
    SetPagination((prev) => ({ ...prev, pageNo: 0 }));
  };

  const handleResetToToday = () => {
    SetFilters({
      visitorName: "",
      visitorContact: "",
      status: undefined,
      fromDate: todayDate,
      toDate: todayDate,
    });
    SetPagination((prev) => ({ ...prev, pageNo: 0 }));
  };

  if (loading) {
    return <LoadingComponent text={"Please Wait, Data is Loading"} />;
  }

  const columns = [
    {
      title: "Visitor Name",
      dataIndex: "visitorInfo",
      key: "visitorInfo",
      render: (visitorInfo) => (
        <Text className="text-blue-800 font-medium text-sm">
          {visitorInfo?.visitorName || "Unknown"}
        </Text>
      ),
    },
    {
      title: "Contact",
      dataIndex: "visitorInfo",
      key: "visitorInfo",
      render: (visitorInfo) => (
        <Text className="text-slate-800 font-medium text-sm">
          {visitorInfo?.visitorContact || "Unknown"}
        </Text>
      ),
    },
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
  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div>
            <Title
              level={4}
              className="!m-0 !font-bold text-slate-800 tracking-tight"
            >
              Visit Management
            </Title>
            <Text type="secondary" className="text-xs">
              Showing logs for{" "}
              <span className="font-semibold text-blue-600">
                {filters.fromDate === todayDate
                  ? "Today"
                  : filters.fromDate || "All Time"}
              </span>
            </Text>
          </div>
          {loading && (
            <Text className="text-xs font-semibold text-blue-600 animate-pulse">
              Syncing data stream...
            </Text>
          )}
        </div>
        <Card
          className="shadow-sm border-slate-200/80 rounded-xl"
          bodyStyle={{ padding: "16px" }}
        >
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-grow">
              <Input
                placeholder="Search visitor name..."
                prefix={<SearchOutlined className="text-slate-400" />}
                value={filters.visitorName}
                onChange={(e) =>
                  handleFilterChange("visitorName", e.target.value)
                }
                className="h-10 rounded-lg text-sm"
                allowClear
              />

              <Input
                placeholder="Search contact no..."
                prefix={<PhoneOutlined className="text-slate-400" />}
                value={filters.visitorContact}
                onChange={(e) =>
                  handleFilterChange("visitorContact", e.target.value)
                }
                className="h-10 rounded-lg text-sm"
                allowClear
              />

              <Select
                placeholder="Select Status"
                value={filters.status}
                onChange={(val) => handleFilterChange("status", val)}
                className="h-10 rounded-lg text-sm w-full"
                allowClear
                options={[
                  { value: "PENDING", label: "Pending" },
                  { value: "APPROVED", label: "Approved" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "REJECTED", label: "Rejected" },
                ]}
              />

              {/* AntD RangePicker reading the state wrapper objects properly */}
              <RangePicker
                value={
                  filters.fromDate
                    ? [dayjs(filters.fromDate), dayjs(filters.toDate)]
                    : null
                }
                onChange={handleDateRangeChange}
                className="h-10 rounded-lg border-slate-300 w-full"
              />
            </div>

            {/* Reset Actions Cluster */}
            <div className="flex gap-2 self-start xl:self-auto">
              <Button
                type="default"
                onClick={handleResetToToday}
                className="h-10 rounded-lg text-xs font-medium border-slate-300 hover:text-blue-600 hover:border-blue-300"
              >
                Today Only
              </Button>
              <Button
                type="text"
                danger
                icon={<ClearOutlined />}
                onClick={resetAllFilters}
                className="h-10 px-3 rounded-lg text-xs font-bold hover:bg-red-50 flex items-center justify-center gap-1"
              >
                Clear All
              </Button>
            </div>
          </div>
        </Card>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <Table
            dataSource={pagingData.data}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.pageNo + 1,
              pageSize: pagination.pageSize,
              total: pagingData.totalData,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              onChange: (page, size) => {
                SetPagination((prev) => ({
                  ...prev,
                  pageNo: page - 1,
                  pageSize: size,
                }));
              },
            }}
            onChange={(_, __, sorter) => {
              if (sorter.field) {
                SetPagination((prev) => ({
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

export default VisitsPage;
