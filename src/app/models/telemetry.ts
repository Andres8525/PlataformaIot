export type VehicleStatus = 'online' | 'offline';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface VehicleTelemetry {
  id: string;
  name: string;
  status: VehicleStatus;
  battery: number;
  signal: number;
  speed: number;
  temperature: number;
  latitude: number;
  longitude: number;
  mapX: number;
  mapY: number;
  updatedAt: Date;
}

export interface TelemetryAlert {
  id: string;
  vehicleId: string;
  message: string;
  severity: AlertSeverity;
  createdAt: Date;
}

export interface TelemetryEvent {
  sequence: number;
  receivedAt: Date;
  vehicleId: string;
}
