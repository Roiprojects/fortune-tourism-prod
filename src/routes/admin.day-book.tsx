import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "./admin";

export const Route = createFileRoute("/admin/day-book")({
  head: () => ({
    meta: [
      { title: "Day Book Reports | Fortune Tourism Admin" },
      {
        name: "description",
        content: "Fortune Tourism live Day Book Reports and transaction double-entry ledger.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <AdminPage initialService="daybook" />,
});
