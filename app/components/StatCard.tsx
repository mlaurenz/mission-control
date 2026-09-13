// app/components/StatCard.tsx - Reusable stat card
interface StatCardProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'green' | 'yellow' | 'blue' | 'red' | 'alert';
  subtext?: string;
  alertLabel?: string;
}

const VARIANTS = {
  default: 'bg-gray-50 border-gray-200 text-gray-900',
  green: 'bg-green-50 border-green-300 text-green-800',
  yellow: 'bg-yellow-50 border-yellow-300 text-yellow-800',
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  red: 'bg-red-50 border-red-300 text-red-700',
  alert: 'bg-red-50 border-red-600 text-red-700',
};

const LABEL_COLORS = {
  default: 'text-gray-500',
  green: 'text-green-700',
  yellow: 'text-yellow-700',
  blue: 'text-blue-700',
  red: 'text-red-600',
  alert: 'text-red-600',
};

export default function StatCard({ label, value, variant = 'default', subtext, alertLabel }: StatCardProps) {
  const isAlert = variant === 'alert';
  
  return (
    <div className={`
      relative p-4 rounded-lg border-2 text-center
      ${VARIANTS[variant]}
      ${isAlert ? 'shadow-[0_0_0_1px_#dc2626,0_4px_12px_rgba(220,38,38,0.15)] animate-pulse-slow' : ''}
    `}>
      {alertLabel && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
          ⚠ {alertLabel}
        </span>
      )}
      <p className={`text-xs uppercase font-semibold ${LABEL_COLORS[variant]}`}>
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${variant === 'alert' ? 'text-3xl' : ''}`}>
        {value}
      </p>
      {subtext && (
        <p className={`text-xs mt-0.5 ${LABEL_COLORS[variant]} opacity-80`}>{subtext}</p>
      )}
    </div>
  );
}
