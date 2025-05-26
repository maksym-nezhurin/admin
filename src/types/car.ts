export interface ICarModel {
  id: string;
  value: string;
  engine: string;
  label: string;
  weight: string;
  transmission: string;
  model: string;
  country: string;
}

export interface IBrand {
  make_id: string;
  make_display: string;
  make_is_common: string;
  make_country: string;
}

export interface IModel {
  id: string;
  model_name: string;
  model_make_id: string;
}

export interface IVariant {
  make_country: string;
  make_display: string;
  model_0_to_100_kph: number | null;
  model_body: string;
  model_co2: number | null;
  model_doors: string;
  model_drive: string;
  model_engine_bore_mm: number | null;
  model_engine_cc: string;
  model_engine_compression: string;
  model_engine_cyl: string;
  model_engine_fuel: string;
  model_engine_position: string;
  model_engine_power_ps: string;
  model_engine_power_rpm: number | null;
  model_engine_stroke_mm: number | null;
  model_engine_torque_nm: string;
  model_engine_torque_rpm: number | null;
  model_engine_type: string;
  model_engine_valves_per_cyl: string;
  model_fuel_cap_l: string;
  model_height_mm: number | null;
  model_id: string;
  model_length_mm: number | null;
  model_lkm_city: string;
  model_lkm_hwy: string;
  model_lkm_mixed: string;
  model_make_display: string;
  model_make_id: string;
  model_name: string;
  model_seats: number | null;
  model_sold_in_us: string;
  model_top_speed_kph: number | null;
  model_transmission_type: string;
  model_trim: string;
  model_weight_kg: string;
  model_wheelbase_mm: number | null;
  model_width_mm: number | null;
  model_year: string;
}