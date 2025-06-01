import NavigationMenu from "../NavigationMenu/NavigationMenu";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <NavigationMenu />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}