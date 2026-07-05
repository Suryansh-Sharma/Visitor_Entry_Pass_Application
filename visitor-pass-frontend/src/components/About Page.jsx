import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { Button, Card, Divider, Typography } from "antd";
import {
  CalendarOutlined,
  DesktopOutlined,
  HeartFilled,
  HistoryOutlined,
  IdcardOutlined,
  MailOutlined,
  RobotOutlined,
  SearchOutlined,
  SendOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

function AboutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "About Application";
  }, []);

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none">
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
              onClick={() => navigateTo(`/all-visit`)}
              className="h-11 rounded-xl font-medium border-slate-300 shadow-sm text-indigo-600 hover:!text-indigo-500 hover:!border-indigo-300 text-sm"
            >
              Today's Visits
            </Button>

            <Button
              type="default"
              size="large"
              icon={<UserAddOutlined />}
              onClick={() => navigateTo("/add-visit")}
              className="h-11 rounded-xl font-medium border-slate-300 shadow-sm text-emerald-600 hover:!text-emerald-500 hover:!border-emerald-300 text-sm"
            >
              Add New Visit
            </Button>

            <Button
              type="default"
              size="large"
              icon={<SearchOutlined />}
              onClick={() => navigateTo("/search")}
              className="h-11 rounded-xl font-medium border-slate-300 shadow-sm text-sky-600 hover:!text-sky-500 hover:!border-sky-300 text-sm"
            >
              Search Visitor
            </Button>

            <Button
              type="default"
              size="large"
              icon={<SendOutlined />}
              onClick={() => navigateTo("/telegramId")}
              className="h-11 rounded-xl font-medium border-slate-300 shadow-sm text-violet-600 hover:!text-violet-500 hover:!border-violet-300 text-sm"
            >
              Telegram IDs
            </Button>
          </div>
        </section>

        <Divider className="border-slate-200" />

        {/* Core System Architectural Narrative */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Left-Aligned Clean Section Heading */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 block mb-1">
              System Overview
            </span>
            <Title
              level={4}
              className="!font-extrabold !text-slate-800 !m-0 tracking-tight"
            >
              Core Application Architecture
            </Title>
          </div>

          <Paragraph className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-3xl">
            The Visitor Entry Pass System is engineered as an enterprise-grade
            ecosystem. It leverages high-performance microservices and native
            window wrappers to achieve near-zero latency authorization logs
            across distributed local networks.
          </Paragraph>

          <Divider className="border-slate-100 !my-4" />

          {/* Scannable Technology Badge Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Node 1: Java Backend */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5 flex flex-col justify-between transition-all hover:bg-slate-50">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Backend Core
              </span>
              <div>
                <span className="font-extrabold text-slate-800 text-sm block">
                  Java Spring Boot
                </span>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                  REST & GraphQL APIs
                </span>
              </div>
            </div>

            {/* Node 2: React Frontend */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5 flex flex-col justify-between transition-all hover:bg-slate-50">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Interface Layer
              </span>
              <div>
                <span className="font-extrabold text-slate-800 text-sm block">
                  React JS
                </span>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                  Ant Design & Tailwind
                </span>
              </div>
            </div>

            {/* Node 3: Electron Wrapper */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5 flex flex-col justify-between transition-all hover:bg-slate-50">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Desktop Native
              </span>
              <div>
                <span className="font-extrabold text-slate-800 text-sm block">
                  Electron Framework
                </span>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                  Cross-Platform Runtime
                </span>
              </div>
            </div>

            {/* Node 4: MongoDB Database */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5 flex flex-col justify-between transition-all hover:bg-slate-50">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Data Engine
              </span>
              <div>
                <span className="font-extrabold text-slate-800 text-sm block">
                  MongoDB Atlas
                </span>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                  Document Storage Schemas
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid Architecture */}
        <section className="space-y-6">
          <Title level={4} className="text-center !font-bold !text-slate-800">
            Key Functional Modules
          </Title>

          {/* 💡 FIXED GRID CLASSES: Cleared strange column assignments for balanced structural symmetry */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card
              hoverable
              className="border-slate-200/70 shadow-sm rounded-xl"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-lg flex items-center justify-center flex-shrink-0">
                  <IdcardOutlined />
                </div>
                <div>
                  <Title
                    level={5}
                    className="!m-0 !font-semibold text-slate-800 text-sm"
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
                <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl text-lg flex items-center justify-center flex-shrink-0">
                  <SearchOutlined />
                </div>
                <div>
                  <Title
                    level={5}
                    className="!m-0 !font-semibold text-slate-800 text-sm"
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
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-lg flex items-center justify-center flex-shrink-0">
                  <DesktopOutlined />
                </div>
                <div>
                  <Title
                    level={5}
                    className="!m-0 !font-semibold text-slate-800 text-sm"
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
              className="border-slate-200/70 shadow-sm rounded-xl"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl text-lg flex items-center justify-center flex-shrink-0">
                  <HistoryOutlined />
                </div>
                <div>
                  <Title
                    level={5}
                    className="!m-0 !font-semibold text-slate-800 text-sm"
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
              className="border-slate-200/70 shadow-sm rounded-xl"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl text-lg flex items-center justify-center flex-shrink-0">
                  <RobotOutlined />
                </div>
                <div>
                  <Title
                    level={5}
                    className="!m-0 !font-semibold text-slate-800 text-sm"
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
