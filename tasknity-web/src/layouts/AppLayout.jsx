import Header from "../components/Header";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <>
      <Header />
      <main className="pt-4">
        <Outlet />
      </main>
    </>
  );
}
