import { FC } from "react";

const Footer: FC<{}> = () => {
  return (
    <footer className="mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            <a
              href="https://ueckoken.club"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              ©️ {new Date().getFullYear()} UEC Koken.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
