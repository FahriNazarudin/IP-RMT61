import React from "react";

export default function Button(props) {
  const {
    title,
    type = "button",
    onClick,
    variant = "primary",
    icon,
    disabled = false,
    fullWidth = false,
    size = "medium",
    className = "",
    children,
  } = props;

  const sizeClasses = {
    small: "py-1 px-3 text-sm",
    medium: "py-2 px-4",
    large: "py-3 px-6 text-lg",
  };

  const buttonClasses = `
    btn 
    btn-${variant} 
    ${sizeClasses[size]} 
    ${fullWidth ? "w-full" : ""} 
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {title || children}
    </button>
  );
}
