export default function NeoButton({ children, className = "", ...props }) {
    return (
        <button
            className={`neo-pill px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-slate-700 active:scale-[0.99] ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
