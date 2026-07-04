import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../i18";
import LoginUserComp from "./LoginUserComp";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

function renderLogin(createNotification = jest.fn()) {
  const setLogin = jest.fn();
  render(<LoginUserComp setLogin={setLogin} createNotification={createNotification} />);
  return { setLogin };
}

beforeEach(() => {
  jest.restoreAllMocks();
  mockNavigate.mockClear();
  window.localStorage.clear();
});

describe("LoginUserComp", () => {
  it("disables the login button until both fields are filled", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /login/i })).toBeDisabled();
  });

  it("shows a validation message for a malformed email", async () => {
    renderLogin();
    const [emailInput] = screen.getAllByPlaceholderText(/email/i);
    await userEvent.type(emailInput, "not-an-email");
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it("logs in successfully, stores the apiKey, and navigates to /myTasks", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ apiKey: "signed.jwt.token", id: 1, email: "user@example.com" }),
    });

    const { setLogin } = renderLogin();
    const [emailInput] = screen.getAllByPlaceholderText(/email/i);
    const [passwordInput] = screen.getAllByPlaceholderText(/password/i);

    await userEvent.type(emailInput, "user@example.com");
    await userEvent.type(passwordInput, "correct-password");

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(setLogin).toHaveBeenCalledWith(true));
    expect(window.localStorage.getItem("apiKey")).toBe("signed.jwt.token");
    expect(mockNavigate).toHaveBeenCalledWith("/myTasks");
  });

  it("shows visible feedback when login fails (regression test - this used to fail silently)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "invalid email or password" }),
    });
    const createNotification = jest.fn();

    renderLogin(createNotification);
    const [emailInput] = screen.getAllByPlaceholderText(/email/i);
    const [passwordInput] = screen.getAllByPlaceholderText(/password/i);

    await userEvent.type(emailInput, "user@example.com");
    await userEvent.type(passwordInput, "wrong-password");
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(createNotification).toHaveBeenCalledWith("error", "invalid email or password");
  });
});
