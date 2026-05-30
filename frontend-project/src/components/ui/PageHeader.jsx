export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500 md:text-base">{subtitle}</p>}
    </div>
  );
}
