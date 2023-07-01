import { useTheme } from "next-themes";

const DarkModeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      className="bg-gray-300 dark:bg-gray-700 rounded-full w-10 h-6 flex items-center focus:outline-none"
      onClick={toggleTheme}
    >
      <div
        className={`bg-white dark:bg-gray-500 rounded-full ml-1.5 w-4 h-4 transition-transform ${
          theme === "dark" ? "translate-x-3" : ""
        }`}
      ></div>
    </button>
  );
};

export default DarkModeToggle;
