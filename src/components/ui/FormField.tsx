interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  textarea?: boolean;
  large?: boolean;
  step?: string;
  min?: string;
}

export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
  options,
  textarea,
  large,
  step,
  min,
}: FormFieldProps) {
  const baseClass = `w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
    large ? "px-4 py-4 text-lg" : "px-3 py-2.5 text-sm"
  }`;

  return (
    <div>
      <label htmlFor={name} className={`block font-medium text-gray-700 mb-1 ${large ? "text-base" : "text-sm"}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={baseClass}
        >
          <option value="">-- Vyberte --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={3}
          className={baseClass}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          step={step}
          min={min}
          className={baseClass}
        />
      )}
    </div>
  );
}
