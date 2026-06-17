export function Card({ children, className = "" }) {
  return <section className={`glass rounded-lg p-4 ${className}`}>{children}</section>;
}
