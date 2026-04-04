export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Playful background blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-coral/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-bounce-soft" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-yellow/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-bounce-soft" style={{ animationDelay: '1s' }} />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-brand-blue/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-bounce-soft" style={{ animationDelay: '2s' }} />
      
      <div className="w-full max-w-md relative z-10 px-4">
        {children}
      </div>
    </div>
  );
}
