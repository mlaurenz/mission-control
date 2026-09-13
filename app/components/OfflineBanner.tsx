// app/components/OfflineBanner.tsx
export default function OfflineBanner({ message = 'Bridge offline — datos no disponibles' }: { message?: string }) {
  return (
    <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-6 text-center">
      <p className="text-yellow-800">
        ⚠️ <strong>Bridge offline</strong> — {message}
      </p>
    </div>
  );
}
