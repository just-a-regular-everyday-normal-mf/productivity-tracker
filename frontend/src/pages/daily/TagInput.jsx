import { useState } from "react";

export default function TagInput({ tags, onChange, disabled = false, placeholder }) {
  const [value, setValue] = useState("");

  function addTag(raw) {
    const tag = raw.trim();
    if (!tag) return;
    if (tags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      setValue("");
      return;
    }
    onChange([...tags, tag]);
    setValue("");
  }

  function removeTag(index) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div className="tag-input">
      <div className="tag-pills">
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} className="tag-pill">
            {tag}
            <button
              type="button"
              disabled={disabled}
              aria-label={`Remove ${tag}`}
              onClick={() => removeTag(index)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addTag(value);
          }
        }}
      />
    </div>
  );
}
