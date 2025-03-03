    import { useEffect, useState } from "react";
    import { HiMoon, HiSun } from "react-icons/hi"; // ✅ Import Icons

    const DarkModeToggle = () => {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    useEffect(() => {
        if (darkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
        } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    return (
        <button
        onClick={() => setDarkMode(!darkMode)}
        className="text-red-600 rounded flex items-center ml-4"
        >
        {darkMode ? <HiMoon size={30} /> : <HiSun size={30} />}
        </button>
    );
    };

    export default DarkModeToggle;
