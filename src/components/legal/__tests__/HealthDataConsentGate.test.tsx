import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

const getStatusMock = vi.fn();

vi.mock("@/services/consentService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/consentService")>();
  return {
    ...actual,
    getHealthDataConsentStatus: (...a: unknown[]) => getStatusMock(...a),
    recordHealthDataConsent: vi.fn(),
  };
});

const useAuthMock = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

import HealthDataConsentGate from "../HealthDataConsentGate";

const renderGate = (path = "/") => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <HealthDataConsentGate />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  getStatusMock.mockReset();
  useAuthMock.mockReset();
  useAuthMock.mockReturnValue({ user: { id: "u1" }, signOut: vi.fn() });
});

describe("HealthDataConsentGate", () => {
  it("需要同意时弹出阻断式对话框", async () => {
    getStatusMock.mockResolvedValue({ status: "required" });
    renderGate();

    expect(await screen.findByText("健康数据使用同意")).toBeInTheDocument();
    expect(screen.getByText("同意并继续")).toBeInTheDocument();
    expect(screen.getByText("暂不同意，退出登录")).toBeInTheDocument();
  });

  it("已同意当前版本时不渲染任何内容", async () => {
    getStatusMock.mockResolvedValue({ status: "granted", consentedAt: "2026-07-18T00:00:00Z" });
    renderGate();

    await waitFor(() => expect(getStatusMock).toHaveBeenCalled());
    expect(screen.queryByText("健康数据使用同意")).not.toBeInTheDocument();
  });

  it("迁移未应用（unavailable）时放行，不锁死应用", async () => {
    getStatusMock.mockResolvedValue({ status: "unavailable" });
    renderGate();

    await waitFor(() => expect(getStatusMock).toHaveBeenCalled());
    expect(screen.queryByText("健康数据使用同意")).not.toBeInTheDocument();
  });

  it("在 /privacy 等豁免路由上不拦截，用户可先阅读政策", async () => {
    getStatusMock.mockResolvedValue({ status: "required" });
    renderGate("/privacy");

    await waitFor(() => expect(screen.queryByText("健康数据使用同意")).not.toBeInTheDocument());
    expect(getStatusMock).not.toHaveBeenCalled();
  });

  it("未登录时不查询也不渲染", async () => {
    useAuthMock.mockReturnValue({ user: null, signOut: vi.fn() });
    getStatusMock.mockResolvedValue({ status: "required" });
    renderGate();

    await waitFor(() => expect(screen.queryByText("健康数据使用同意")).not.toBeInTheDocument());
    expect(getStatusMock).not.toHaveBeenCalled();
  });
});
