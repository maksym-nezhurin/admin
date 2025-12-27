import { Button, NumberInput, Select, Group, MultiSelect } from "@mantine/core";
import { useState, useEffect } from "react";

import { prepareOptionsForSelect } from "../../utils/formAdapters";
import { useScrapper, type IFilters } from "../../contexts/ScrapperContext";

import "./Filters.css";

export const Filters = () => {
  const { filters, setFilters, filtersConfig } = useScrapper();
  const [isVirgin, setIsVirgin] = useState(true);
  const [values, setValues] = useState<IFilters>(filters);
  const handleChange = (name: string, value: string[] | null | number | any) => {
    setIsVirgin(false);
    // normalize incoming value: Mantine MultiSelect returns string[] or null
    if (Array.isArray(value)) {
      // convert back to numbers if original data uses numbers
      const parsed = value.map((v: string) => {
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
    <div>
      <div className="filters-container">
      {filtersConfig.map((f) => (
        <div key={f.name}>
          {f.type === "number" && (
            <NumberInput
              type="number"
              label={f.label}
              placeholder={String(f.placeholder)}
              value={Number(values[f.name] || f.placeholder)}
              onChange={(value) => handleChange(f.name, value)}
            />
          )}

          {f.type === "select" && (
            <Select
              label={f.label}
              placeholder={String(f.placeholder)}
              data={prepareOptionsForSelect(f.data)}
              value={values[f.name] !== undefined && values[f.name] !== null ? String(values[f.name]) : null}
              onChange={(value: string | null) => handleChange(f.name, value)}
              clearable
            />
          )}

          {f.type === "multiselect" && (
            <MultiSelect
              label={f.label}
              placeholder={String(f.placeholder)}
              data={prepareOptionsForSelect(f.data)}
              value={Array.isArray(values[f.name]) ? (values[f.name] as (string | number)[]).map(String) : []}
              onChange={(value: string[] | null) => handleChange(f.name, value)}
              clearable
            />
          )}
        </div>
      ))}
      </div>
      <Group style={{ justifyContent: 'center', marginTop: '1rem' }}>
        <Button onClick={applyFilters} disabled={isVirgin}>
          Застосувати
        </Button>
      </Group>
    </div>
  );
};