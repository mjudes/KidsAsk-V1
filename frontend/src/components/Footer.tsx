'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-blue-600 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">KidsAsk.ai</h2>
            <p className="text-blue-100">A safe space for curious minds</p>
          </div>
          
          <div className="flex space-x-8">
            <div>
              <h3 className="font-semibold mb-2">For Parents</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-blue-100 hover:text-white">Safety Features</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Topics</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-blue-100 hover:text-white">Animals</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white">Space</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white">All Topics</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-blue-500 text-center text-sm text-blue-100">
          <p>&copy; {currentYear} KidsAsk.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
