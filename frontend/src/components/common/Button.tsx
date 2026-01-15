import React from 'react'

interface ButtonProps {
  children: React.ReactNode;
  onClick?: ()=>void;
  type?: any ;
  disabled?: boolean ;
  classname?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md";
}

const Button = ({children, ...props}: ButtonProps) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 white-space-nowrap";
    const variantStyles = {
        primary: "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30",
        secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
        outline: "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
    }

    const sizeStyles = {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-5 text-sm"
    }


  return (
    
    <button
    type={props.type || "button"}
    onClick={props.onClick}
    disabled={props.disabled || false}
    className={[baseStyles, variantStyles[props.variant || "primary"], sizeStyles[props.size || "md"], props.classname || ""].join(" ")}
    >
        {children}
    </button>
  )
}

export default Button