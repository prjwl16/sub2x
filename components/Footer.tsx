import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t border-white/20 backdrop-blur-md bg-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} Sub2X. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link
              href="/terms"
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
