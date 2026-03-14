export default function ResetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-container">
      {children}
    </div>
  );
}