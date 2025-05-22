'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white bg-opacity-10 backdrop-blur-sm text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">KidsAsk.AI</h2>
            <p className="text-white text-opacity-80">A safe space for curious minds</p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-6">
            <div>
              <h3 className="font-semibold mb-2">For Parents</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-white text-opacity-80 hover:text-opacity-100">Safety Features</a></li>
                <li><a href="#" className="text-white text-opacity-80 hover:text-opacity-100">Privacy Policy</a></li>
                <li><a href="#" className="text-white text-opacity-80 hover:text-opacity-100">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Topics</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-white text-opacity-80 hover:text-opacity-100">Animals</a></li>
                <li><a href="#" className="text-white text-opacity-80 hover:text-opacity-100">Space</a></li>
                <li><a href="#" className="text-white text-opacity-80 hover:text-opacity-100">All Topics</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white border-opacity-20 text-center text-sm text-white text-opacity-80">
          <p>&copy; {currentYear} KidsAsk.AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
