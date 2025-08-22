import { useEffect, useRef, useState } from "react";

const CustomDropdown = ({ options = [], value = "", onChange, textHeader, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // const handleSelect = (option: any) => {
  //   onChange(option);
  // };
  
  const handleSelect = (value: any, option: { label: string; value: any }) => {
    onChange(option);
    setIsOpen(false);
  };  

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%" }} ref={dropdownRef}>
      <p style={{
        color: "#607E9C",
        fontSize: "20px",
        fontWeight: "bold",
        margin: "10px 0px"
      }}>
        {textHeader}
      </p>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          flex: 1,
          border: "2px solid #607E9C",
          borderRadius: "50px",
          padding: "16px",
          paddingLeft: "16px",
          fontSize: "20px",
          color: "#607E9C",
          width: "100%",
          background: "transparent"
        }}
      >
        {value || placeholder}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          display: "none"
        }}
      >
        {options.map((opt: { value: string; label: string; }, i: number) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {isOpen && (
        <ul
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            right: 0,
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
            height: "auto",
            maxHeight: "80px",
            overflowY: "auto",
            margin: 0,
            padding: 0,
            listStyle: "none",
            scrollbarWidth: "thin",
            scrollbarColor: "#456078 #f1f1f1",
            zIndex: 2
          }}
        >
          {options.map((opt: { label: string; value: any }, i: number) => (
            <li
              key={i}
              onClick={() => handleSelect(opt.value, opt)}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                fontSize: "16px",
                color: "#456078",
                background: value === opt.value ? "#e4ebf3" : "transparent"
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#e4ebf3")
              }
              onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                value === opt.value ? "#e4ebf3" : "transparent")
              }
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
