import { useRouter } from "next/router";
import { MobileNav } from "./MobileNav";
export default function Layout({ children }) {
  const { pathname } = useRouter();return <>{children}</>}