"use client";

interface FilterSelectProps {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: { value: string; label: string }[];
}

export function FilterSelect({ value, onChange, label, options }: FilterSelectProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base cursor-pointer"
        style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem" }}
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
