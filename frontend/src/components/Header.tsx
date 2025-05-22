'use client';

export default function Header() {
  return (
    <header className="bg-white bg-opacity-10 backdrop-blur-sm shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
            K
          </div>
          <h1 className="text-2xl font-display font-bold text-white">KidsAsk.AI</h1>
        </div>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="#" className="text-white hover:text-blue-200 transition">Home</a>
            </li>
            <li>
              <a href="#" className="text-white hover:text-blue-200 transition">Topics</a>
            </li>
            <li>
              <a href="#" className="text-white hover:text-blue-200 transition">Parent Guide</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
