import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const useOutsideAlerter = (ref, callback) => {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback]);
};

const CustomSelect = ({ value, options, onChange, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Use the custom hook to close the dropdown when clicking outside
    useOutsideAlerter(wrapperRef, () => setIsOpen(false));

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            {/* The main button that looks like an input */}
            <button
        
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full border border-gray-300 rounded-lg pl-12 pr-10 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition duration-300 bg-white text-left flex items-center justify-between"
            >
                <div className="flex items-center">
                    {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                    <span className="text-gray-700">{value}</span>
                </div>
                {isOpen ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
            </button>

            {/* The dropdown menu */}
            {isOpen && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <li
                            key={option}
                            onClick={() => handleSelect(option)}
                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-700"
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomSelect;