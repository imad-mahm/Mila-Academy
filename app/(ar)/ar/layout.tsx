import "../../globals.css";
import RootShell from "../../components/RootShell";
import { rootMetadata } from "../../components/pages/meta";

// The Arabic pages (/ar, /ar/football, /ar/basketball): right-to-left, in Arabic.
export const generateMetadata = () => rootMetadata("ar");

export default function ArabicRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="ar">{children}</RootShell>;
}
