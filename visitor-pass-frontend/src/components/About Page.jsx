import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, Button, Typography, Space, Divider } from "antd";
import {
  CalendarOutlined,
  UserAddOutlined,
  SearchOutlined,
  SendOutlined,
  IdcardOutlined,
  HistoryOutlined,
  RobotOutlined,
  DesktopOutlined,
  MailOutlined,
  HeartFilled,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

function AboutPage() {
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "About Application";
  }, []);

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Premium Gradient Header Hero */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16 px-4 text-center shadow-md">
        <div className="max-w-3xl mx-auto">
          <Title
            level={1}
            className="!text-white !font-extrabold tracking-tight !mb-3"
          >
            About This App
          </Title>
          <Paragraph className="text-white/90 text-base max-w-xl mx-auto font-medium">
            A secure, modern, and high-performance solution for digital visitor
            management, engineered with accuracy and care.
          </Paragraph>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto px-4 py-10 flex-grow space-y-12">
        {/* Quick Links Block */}
        <section className="text-center">
          <Title level={4} className="!font-bold !text-slate-800 !mb-5">
            Quick Actions
          </Title>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            <Button
              type="default"
              size="large"
              icon={<CalendarOutlined />}
              onClick={() =>
                navigateTo(
                  `/visits-by-date/${today}?page_no=0&page_size=8&sort_by=visitedOn&sort_order=ASC`,
                )
              }
              className="h-11 rounded-xl font-medium border-slate-300 shadow-sm text-indigo-600 hover:!text-indigo-500 hover:!border-indigo-300"
            >
              Today's Visits
            </Button>

            <Button
              type="default"
              size="large"
              icon={<UserAddOutlined />}
              onClick={() => navigateTo("/add-visit")}
              className="h-11 rounded-xl font-medium border-slate-300 shadow-sm text-emerald-600 hover:!text-emerald-500 hover:!border-emerald-300"
            >
              Add New Visit
            </Button>

            <Button
              type="default"
              size="large"
              icon={<SearchOutlined />}
              onClick={() =>
                navigateTo(
                  "/search/visitor/Name/none?page_no=0&page_size=8&sort_by=visitorName&sort_dir=ASC",
                )
              }
              className="h-11 rounded-xl font-medium border-slate-300 shadow-sm text-sky-600 hover:!text-sky-500 hover:!border-sky-300"
            >
              Search Visitor
            </Button>

            <Button
              type="default"
              size="large"
              icon={<SendOutlined />}
              onClick={() => navigateTo("/telegramId")}
              className="h-11 rounded-xl font-medium border-slate-300 shadow-sm text-violet-600 hover:!text-violet-500 hover:!border-violet-300"
            >
              Telegram IDs
            </Button>
          </div>
        </section>

        <Divider className="border-slate-200" />

        {/* Core System Architectural Narrative */}
        <section className="text-center max-w-2xl mx-auto">
          <Title level={4} className="!font-bold !text-slate-800 !mb-3">
            System Description
          </Title>
          <Paragraph className="text-slate-600 leading-relaxed text-sm">
            This dashboard streamlines verification tracking protocols using a
            cross-platform pipeline. Leveraging high-performance backend
            microservices built with **Java Spring Boot**, a fluid web layer via
            **React JS**, native operating system flexibility via **Electron**,
            and a schema-free **MongoDB** database, it provides an uncompromised
            enterprise-grade ecosystem tailored for modern workspaces.
          </Paragraph>
        </section>

        {/* Feature Grid Architecture */}
        <section className="space-y-6">
          <Title level={4} className="text-center !font-bold !text-slate-800">
            Key Functional Modules
          </Title>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card
              hoverable
              className="border-slate-200/70 shadow-sm rounded-xl"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-lg flex items-center justify-center">
                  <IdcardOutlined />
                </div>
                <div>
                  <Title
                    level={5}
                    className="!m-0 !font-semibold text-slate-800"
                  >
                    Visitor Registration
                  </Title>
                  <Text className="text-slate-500 text-xs block mt-1.5 leading-normal">
                    Quickly onboard new walk-ins using dynamic validation forms
                    optimized for fast clearance.
                  </Text>
                </div>
              </div>
            </Card>

            <Card
              hoverable
              className="border-slate-200/70 shadow-sm rounded-xl"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl text-lg flex items-center justify-center">
                  <SearchOutlined />
                </div>
                <div>
                  <Title
                    level={5}
                    className="!m-0 !font-semibold text-slate-800"
                  >
                    Search & Lookup
                  </Title>
                  <Text className="text-slate-500 text-xs block mt-1.5 leading-normal">
                    Query historical data immediately using rapid search indexes
                    parsing multiple fields instantly.
                  </Text>
                </div>
              </div>
            </Card>

            <Card
              hoverable
              className="border-slate-200/70 shadow-sm rounded-xl"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-lg flex items-center justify-center">
                  <DesktopOutlined />
                </div>
                <div>
                  <Title
                    level={5}
                    className="!m-0 !font-semibold text-slate-800"
                  >
                    Multi-Platform Access
                  </Title>
                  <Text className="text-slate-500 text-xs block mt-1.5 leading-normal">
                    Native application builds compiled to deploy seamlessly
                    across Linux, Windows, and traditional web servers.
                  </Text>
                </div>
              </div>
            </Card>

            <Card
              hoverable
              className="border-slate-200/70 shadow-sm rounded-xl md:col-start-1 md:col-end-2"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl text-lg flex items-center justify-center">
                  <HistoryOutlined />
                </div>
                <div>
                  <Title
                    level={5}
                    className="!m-0 !font-semibold text-slate-800"
                  >
                    Log History
                  </Title>
                  <Text className="text-slate-500 text-xs block mt-1.5 leading-normal">
                    Comprehensive chronological lookup metrics allowing granular
                    monitoring and workspace security profiling.
                  </Text>
                </div>
              </div>
            </Card>

            <Card
              hoverable
              className="border-slate-200/70 shadow-sm rounded-xl md:col-start-2 md:col-end-3"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl text-lg flex items-center justify-center">
                  <RobotOutlined />
                </div>
                <div>
                  <Title
                    level={5}
                    className="!m-0 !font-semibold text-slate-800"
                  >
                    Telegram Engine
                  </Title>
                  <Text className="text-slate-500 text-xs block mt-1.5 leading-normal">
                    Automated chat-bot handling continuous authorization
                    workflows, alert dispatches, and status adjustments.
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>

      {/* Modern Centered Corporate Footer Layout */}
      <footer className="w-full bg-slate-900 text-slate-400 py-8 px-4 border-t border-slate-800 mt-auto text-center text-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 font-medium text-slate-300">
            <span>Designed & Engineered with</span>
            <HeartFilled className="text-red-500 text-sm animate-pulse mx-0.5" />
            <span>
              by <strong className="text-white font-semibold">Suryansh</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors hover:border-slate-600">
            <MailOutlined className="text-indigo-400" />
            <a
              href="mailto:suryanshsharma1942@gmail.com"
              className="text-slate-300 hover:text-white font-mono font-medium tracking-wide"
            >
              suryanshsharma1942@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AboutPage;
