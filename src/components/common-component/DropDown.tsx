import { useEffect, useRef, useState } from "react";

const CustomDropdown = ({ options = [], value = "", onChange, textHeader, placeholder, isSearchable = false, disabled = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // const handleSelect = (option: any) => {
  //   onChange(option);
  // };

  const handleSelect = (value: any, option: { label: string; value: any }) => {
    onChange(option);
    setIsOpen(false);
    if (isSearchable) {
      setSearchText(option.label);
    }
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

  // Filter options if searchable
  const filteredOptions = isSearchable && searchText
    ? options.filter((opt: any) => opt.label.toLowerCase().includes(searchText.toLowerCase()))
    : options;

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
      <input
        type="text"
        value={isSearchable
          ? (isOpen ? searchText : (options.find((opt: any) => opt.value === value)?.label || ""))
          : (options.find((opt: any) => opt.value === value)?.label || "")}
        onFocus={() => !disabled && setIsOpen(true)}
        onClick={() => !disabled && setIsOpen(true)}
        onChange={e => {
          if (isSearchable) {
            setSearchText(e.target.value);
          } else {
            onChange(e.target.value);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1,
          border: "2px solid #607E9C",
          minHeight: "60px",
          borderRadius: "50px",
          padding: "16px",
          paddingLeft: "16px",
          fontSize: "20px",
          color: disabled ? "#ccc" : "#607E9C",
          width: "100%",
          background: disabled ? "#f5f5f5" : "transparent",
          cursor: disabled ? "not-allowed" : "pointer"
        }}
      />
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
        <div style={{
          // position: "absolute",
          // width: "100%",
          // left: 0,
          // top: "100%",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
          height: "auto",
          maxHeight: "180px",
          overflowY: "auto",
          margin: 0,
          padding: "12px 0 0 0",
          zIndex: 9999
        }}>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0
            }}
          >
            {filteredOptions.length === 0 && (
              <li style={{ padding: "10px 14px", color: "#999" }}>No options found</li>
            )}
            {filteredOptions.map((opt: { label: string; value: any }, i: number) => (
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
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
