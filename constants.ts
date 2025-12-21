import { VehicleModel, Urgency } from './types';

// km/L
export const CONSUMPTION_RATES: { [key in VehicleModel]: number } = {
  [VehicleModel.Truck]: 5,
  [VehicleModel.PickupTruck]: 8,
  [VehicleModel.Van]: 10,
};

// % Surcharge
export const URGENCY_FACTORS: { [key in Urgency]: number } = {
  [Urgency.Baixa]: 0,
  [Urgency.Media]: 0.15,
  [Urgency.Alta]: 0.30,
  [Urgency.Critica]: 0.50,
};

// R$ per km
export const MAINTENANCE_COSTS_PER_KM: { [key in VehicleModel]: number } = {
  [VehicleModel.Truck]: 0.80,
  [VehicleModel.PickupTruck]: 0.40,
  [VehicleModel.Van]: 0.35,
};

// R$ per km
export const DRIVER_HELPER_COSTS_PER_KM: { [key in VehicleModel]: number } = {
  [VehicleModel.Truck]: 1.5, // Driver + Helper
  [VehicleModel.PickupTruck]: 0.9, // Driver only
  [VehicleModel.Van]: 0.9, // Driver only
};

// % of freight value
export const INSURANCE_RATE = 0.01; // 1%