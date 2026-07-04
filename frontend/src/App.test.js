import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "./i18";
import App from "./App";

beforeEach(() => {
  window.localStorage.clear();
});

test("renders the landing page with Register/Login links when logged out", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/Welcome to TaskMaster/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Register/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Login/i).length).toBeGreaterThan(0);
});

test("redirects unknown routes back to the landing page", () => {
  render(
    <MemoryRouter initialEntries={["/this-route-does-not-exist"]}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/Welcome to TaskMaster/i)).toBeInTheDocument();
});
