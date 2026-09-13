// app/components/Card.tsx - Reusable content card/section
interface CardProps {
  title?: string;
  titleRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'blue' | 'yellow';
  maxHeight?: string;
}

const CARD_VARIANTS = {
  default: 'bg-gray-50 border-gray-200',
  blue: 'bg-blue-50 border-blue-300',
  yellow: 'bg-yellow-50 border-yellow-300',
};

export default function Card({ title, titleRight, children, className = '', variant = 'default', maxHeight }: CardProps) {
  return (
    <section className={`rounded-lg border ${CARD_VARIANTS[variant]} ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {titleRight}
        </div>
      )}
      <div className={`p-4 ${maxHeight ? `max-h-[${maxHeight}] overflow-auto` : ''}`}>
        {children}
      </div>
    </section>
  );
}
