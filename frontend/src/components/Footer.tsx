'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 py-4 text-center text-gray-600 mt-auto">
      <div className="container mx-auto px-4 flex flex-wrap justify-center items-center">
        <span className="mx-3"><a href="http://localhost:3050/" className="hover:text-gray-900">&copy; {currentYear} KidsAsk.AI</a></span>
        <a href="#" className="mx-3 text-sm hover:text-gray-900">About Us</a>
        <a href="#" className="mx-3 text-sm hover:text-gray-900">Terms of Use</a>
        <a href="#" className="mx-3 text-sm hover:text-gray-900">Privacy Policy</a>
        <a href="#" className="mx-3 text-sm hover:text-gray-900">Refund Policy</a>
        <a href="#" className="mx-3 text-sm hover:text-gray-900">Contact Us</a>
      </div>
    </footer>
  );
}
