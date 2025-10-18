// src/components/Layout.jsx
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        {/* Navigation */}
      </aside>
      <main className="flex-1 bg-gray-100 p-6">
        {children}
      </main>
    </div>
  );
}
