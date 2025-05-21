'use client';

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
            K
          </div>
          <h1 className="text-2xl font-display font-bold text-blue-600">KidsAsk.ai</h1>
        </div>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="#" className="text-gray-600 hover:text-blue-500">Home</a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:text-blue-500">About</a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:text-blue-500">Parent Guide</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
