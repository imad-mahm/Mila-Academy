import "../globals.css";
import RootShell from "../components/RootShell";
import { rootMetadata } from "../components/pages/meta";

// Title, description, tab icon and link-preview image are all editable from
// the dashboard (Website → Site Content → General). This layout serves the
// English pages and the whole dashboard.
export const generateMetadata = () => rootMetadata("en");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
