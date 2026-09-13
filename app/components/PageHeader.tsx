// app/components/PageHeader.tsx - Reusable page header
interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
  status?: 'online' | 'offline' | null;
  statusTimestamp?: string;
  rightContent?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon, status, statusTimestamp, rightContent }: PageHeaderProps) {
  return (
    <header className="mb-6 pb-4 border-b-2 border-gray-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {icon && <span className="mr-1">{icon}</span>}
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {rightContent}
          {status && (
            <div className="text-right">
              <span className={`
                inline-block px-3 py-1.5 rounded-lg text-sm font-semibold
                ${status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}
              `}>
                {status === 'online' ? '● Online' : '● Offline'}
              </span>
              {statusTimestamp && (
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(statusTimestamp).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
