"use client";

import { useState, useCallback } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Field = {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
};

const FIELD_TYPES = [
  { id: "text", label: "Text", icon: "Aa" },
  { id: "email", label: "Email", icon: "@" },
  { id: "phone", label: "Phone", icon: "📞" },
  { id: "number", label: "Number", icon: "#" },
  { id: "textarea", label: "Paragraph", icon: "¶" },
  { id: "select", label: "Dropdown", icon: "▾" },
  { id: "multiselect", label: "Multi-select", icon: "☑" },
  { id: "checkbox", label: "Checkbox", icon: "☐" },
  { id: "radio", label: "Radio", icon: "◉" },
  { id: "date", label: "Date", icon: "📅" },
];

function emptyField(type: string): Field {
  return { id: crypto.randomUUID(), type, label: `New ${type} field`, placeholder: "", required: false, options: ["Option 1"] };
}

function SortableField({ field, onChange, onRemove, index }: {
  field: Field; onChange: (id: string, upd: Partial<Field>) => void; onRemove: (id: string) => void; index: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [expanded, setExpanded] = useState(false);

  return (
    <div ref={setNodeRef} style={style} className="group rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3 px-4 py-3">
        <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 text-lg">⠿</button>
        <span className="w-20 rounded bg-gray-100 px-2 py-0.5 text-center text-xs font-medium text-gray-600 uppercase">{field.type}</span>
        <input value={field.label} onChange={(e) => onChange(field.id, { label: e.target.value })}
          className="flex-1 border-b border-transparent px-1 py-0.5 text-sm font-medium focus:border-indigo-400 focus:outline-none"
          placeholder="Field label" />
        <label className="flex items-center gap-1 text-xs text-gray-500">
          <input type="checkbox" checked={field.required} onChange={(e) => onChange(field.id, { required: e.target.checked })} />
          Required
        </label>
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-gray-400 hover:text-gray-600">
          {expanded ? "▲" : "▼"}
        </button>
        <button onClick={() => onRemove(field.id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
      </div>
      {expanded && (
        <div className="space-y-3 border-t px-4 py-3">
          <input value={field.placeholder} onChange={(e) => onChange(field.id, { placeholder: e.target.value })}
            className="w-full rounded border px-2 py-1 text-xs" placeholder="Placeholder text" />
          {["select", "multiselect", "checkbox", "radio"].includes(field.type) && (
            <div>
              <label className="text-xs text-gray-500">Options</label>
              {field.options.map((opt, i) => (
                <div key={i} className="mt-1 flex items-center gap-2">
                  <input value={opt} onChange={(e) => {
                    const opts = [...field.options]; opts[i] = e.target.value; onChange(field.id, { options: opts });
                  }} className="flex-1 rounded border px-2 py-1 text-xs" />
                  <button onClick={() => {
                    const opts = field.options.filter((_, j) => j !== i); onChange(field.id, { options: opts.length ? opts : [""] });
                  }} className="text-xs text-red-400">✕</button>
                </div>
              ))}
              <button onClick={() => onChange(field.id, { options: [...field.options, `Option ${field.options.length + 1}`] })}
                className="mt-1 text-xs text-indigo-500 hover:underline">+ Add option</button>
            </div>
          )}
          <div className="rounded-lg border bg-gray-50 p-3">
            <span className="text-xs text-gray-400">Preview</span>
            <FieldPreview field={field} />
          </div>
        </div>
      )}
    </div>
  );
}

function FieldPreview({ field }: { field: Field }) {
  return (
    <div className="mt-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}{field.required && <span className="text-red-400">*</span>}
      </label>
      {["select", "radio"].includes(field.type) ? (
        <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-400" disabled>
          <option>{field.placeholder || "Select..."}</option>
        </select>
      ) : ["multiselect", "checkbox"].includes(field.type) ? (
        <div className="mt-1 space-y-1">
          {field.options.map((o, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-gray-500">
              <input type="checkbox" disabled /> {o}
            </label>
          ))}
        </div>
      ) : field.type === "textarea" ? (
        <textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-400" rows={3} placeholder={field.placeholder} disabled />
      ) : (
        <input type={field.type} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-400" placeholder={field.placeholder || `Enter ${field.type}...`} disabled />
      )}
    </div>
  );
}

export default function FormBuilder({ initial, onSave }: {
  initial?: { title: string; description: string; fields: Field[]; settings: any };
  onSave: (data: { title: string; description: string; schema: string; settings: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [fields, setFields] = useState<Field[]>(initial?.fields || []);
  const [settings, setSettings] = useState(initial?.settings || { submitLabel: "Submit", thankYouMessage: "Thank you!", theme: { primaryColor: "#6366f1", backgroundColor: "#ffffff" } });
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const updateField = (id: string, upd: Partial<Field>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...upd } : f)));
  };

  const removeField = (id: string) => setFields(fields.filter((f) => f.id !== id));

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      title,
      description,
      schema: JSON.stringify({ fields }),
      settings: JSON.stringify(settings),
    });
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <h1 className="text-xl font-bold">{initial ? "Edit Form" : "New Form"}</h1>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving}
            className="rounded-lg bg-indigo-500 px-6 py-2 text-sm text-white hover:bg-indigo-600 disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 p-6">
        <div className="flex-1 space-y-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Form Title"
            className="w-full rounded-xl border bg-white px-6 py-4 text-2xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-300" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)"
            className="w-full rounded-xl border bg-white px-6 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-300" rows={2} />
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {fields.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-400">
                    Add fields from the panel on the right
                  </div>
                )}
                {fields.map((f, i) => (
                  <SortableField key={f.id} field={f} onChange={updateField} onRemove={removeField} index={i} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        <div className="w-72 shrink-0 space-y-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Add Fields</h3>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPES.map((t) => (
                <button key={t.id} onClick={() => setFields([...fields, emptyField(t.id)])}
                  className="flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition hover:border-indigo-300 hover:bg-indigo-50">
                  <span className="text-base">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Settings</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">Submit Button</label>
                <input value={settings.submitLabel} onChange={(e) => setSettings({ ...settings, submitLabel: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Thank You Message</label>
                <input value={settings.thankYouMessage} onChange={(e) => setSettings({ ...settings, thankYouMessage: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Primary Color</label>
                <input type="color" value={settings.theme?.primaryColor || "#6366f1"}
                  onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, primaryColor: e.target.value } })}
                  className="mt-1 h-8 w-full rounded border" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
