import { Button, NumberInput, Select, Stack, Group, MultiSelect } from "@mantine/core";
import { useState, useEffect } from "react";
import "./Filters.css";
import { useScrapper } from "../../contexts/ScrapperContext";

export const Filters = () => {
  const { filters, setFilters, filtersConfig } = useScrapper();

  const [isVirgin, setIsVirgin] = useState(true);
  const [values, setValues] = useState(filters);

  console.log('Filters Component Props:', { filters, values });
  const handleChange = (name: string, value: string[] | null | number | any) => {
    setIsVirgin(false);
    console.log('handleChange', name, value);
    // normalize incoming value: Mantine MultiSelect returns string[] or null
    if (Array.isArray(value)) {
      // convert back to numbers if original data uses numbers
      const parsed = value.map((v) => {
        const n = Number(v);
        return Number.isNaN(n) ? v : n;
      });
      setValues((prev) => ({ ...prev, [name]: parsed }));
    } else if (value === null) {
      // cleared
      setValues((prev) => ({ ...prev, [name]: [] }));
    } else {
      // other controls (Select/NumberInput) may send single value
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const applyFilters = () => {
    setIsVirgin(true);
    setFilters(values);
  };

  useEffect(() => {
    setValues(filters);
    setIsVirgin(true);
  }, [filters]);

  if (!filtersConfig || filtersConfig.length === 0) {
      return <div>No filters available for the selected market.</div>;
  }

  return (
    <Stack gap="md" p="md" style={{ background: "#f8f9fa", borderRadius: 8 }}>
      {filtersConfig.map((f) => (
        <div key={f.name}>
          {f.type === "number" && (
            <NumberInput
              label={f.label}
              placeholder={f.placeholder}
              value={values[f.name]}
              onChange={(value) => handleChange(f.name, value)}
            />
          )}

          {f.type === "select" && (
            <Select
              label={f.label}
              placeholder={f.placeholder}
              data={f.data}
              value={values[f.name]}
              onChange={(value) => handleChange(f.name, value)}
              clearable
            />
          )}

          {f.type === "multiselect" && (
            <MultiSelect
              label={f.label}
              placeholder={f.placeholder}
              data={(f.data || []).map((opt) => ({
                label: String(opt.label),
                value: String(opt.value),
              }))}
              value={(values[f.name] || []).map(String)}
              onChange={(value) => handleChange(f.name, value)}
              clearable
            />
          )}
        </div>
      ))}

      <Group justify="flex-end">
        <Button onClick={applyFilters} disabled={isVirgin}>
          Застосувати
        </Button>
      </Group>
    </Stack>
  );
};