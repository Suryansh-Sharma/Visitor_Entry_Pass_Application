import { HomeOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";
import { useNavigate } from "react-router";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="inset-0 w-screen  bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/60 rounded-2xl shadow-xl p-6 md:p-8 transform transition-all duration-300 hover:scale-[1.01]">
        <Result
          status="404"
          title={
            <span className="text-6xl font-extrabold tracking-tight text-slate-800">
              404
            </span>
          }
          subTitle={
            <div className="space-y-1 mt-2">
              <p className="text-base font-semibold text-slate-700">
                Page Not Found
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-normal">
                The URL you are trying to reach does not exist or might have
                been moved.
              </p>
            </div>
          }
          extra={
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={() => navigate("/", { replace: true })}
              className="h-10 px-6 rounded-lg font-medium text-sm bg-blue-600 hover:bg-blue-500 border-none shadow-md shadow-blue-100 inline-flex items-center justify-center gap-2"
            >
              Back to Dashboard
            </Button>
          }
        />
      </div>
    </div>
  );
}

export default NotFoundPage;
