import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, interval } from 'rxjs';
import { AlertSeverity, TelemetryAlert, TelemetryEvent, VehicleTelemetry } from '../models/telemetry';

const initialVehicles: VehicleTelemetry[] = [
  { id: 'veh-01', name: 'Unidad 01', status: 'online', battery: 92, signal: 4, speed: 48, temperature: 31.2, latitude: 4.6486, longitude: -74.0628, updatedAt: new Date() },
  { id: 'veh-02', name: 'Unidad 02', status: 'online', battery: 76, signal: 3, speed: 62, temperature: 33.8, latitude: 4.6761, longitude: -74.0487, updatedAt: new Date() },
  { id: 'veh-03', name: 'Unidad 03', status: 'online', battery: 58, signal: 4, speed: 34, temperature: 29.6, latitude: 4.6097, longitude: -74.0817, updatedAt: new Date() },
  { id: 'veh-04', name: 'Unidad 04', status: 'online', battery: 84, signal: 5, speed: 91, temperature: 38.4, latitude: 4.6258, longitude: -74.1420, updatedAt: new Date() },
  { id: 'veh-05', name: 'Unidad 05', status: 'offline', battery: 21, signal: 0, speed: 0, temperature: 27.1, latitude: 4.5981, longitude: -74.0738, updatedAt: new Date(Date.now() - 9 * 60_000) },
  { id: 'veh-06', name: 'Unidad 06', status: 'online', battery: 67, signal: 3, speed: 55, temperature: 32.5, latitude: 4.6783, longitude: -74.0490, updatedAt: new Date() },
];

const initialAlerts: TelemetryAlert[] = [
  { id: 'alert-1', vehicleId: 'veh-04', message: 'superó el límite de velocidad · 91 km/h', severity: 'critical', createdAt: new Date(Date.now() - 18_000) },
  { id: 'alert-2', vehicleId: 'veh-03', message: 'temperatura del motor elevada · 29.6 °C', severity: 'warning', createdAt: new Date(Date.now() - 73_000) },
  { id: 'alert-3', vehicleId: 'veh-05', message: 'señal perdida · última posición hace 9 min', severity: 'info', createdAt: new Date(Date.now() - 4 * 60_000) },
];

@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly vehiclesSubject = new BehaviorSubject<VehicleTelemetry[]>(initialVehicles);
  private readonly alertsSubject = new BehaviorSubject<TelemetryAlert[]>(initialAlerts);
  private readonly telemetrySubject = new BehaviorSubject<TelemetryEvent>({
    sequence: 0,
    receivedAt: new Date(),
    vehicleId: 'veh-04',
  });
  private sequence = 0;

  readonly vehicles$ = this.vehiclesSubject.asObservable();
  readonly alerts$ = this.alertsSubject.asObservable();
  readonly telemetry$ = this.telemetrySubject.asObservable();

  constructor() {
    interval(2_500)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.publishSample());
  }

  private publishSample(): void {
    this.sequence += 1;
    const vehicleIndex = (this.sequence - 1) % initialVehicles.length;
    const current = this.vehiclesSubject.value;
    const vehicle = current[vehicleIndex];
    const receivedAt = new Date();

    if (!vehicle) return;

    const speed = this.sequence % 20 === 0 ? 92 : Math.min(82, 38 + ((this.sequence * 7) % 39));
    const temperature = this.sequence % 31 === 0 ? 41.2 : 28 + ((this.sequence * 3) % 12);
    const updatedVehicle: VehicleTelemetry = {
      ...vehicle,
      status: 'online',
      speed,
      temperature,
      latitude: vehicle.latitude + 0.0002,
      longitude: vehicle.longitude + 0.0001,
      updatedAt: receivedAt,
    };

    this.vehiclesSubject.next(current.map((item, index) => index === vehicleIndex ? updatedVehicle : item));
    this.telemetrySubject.next({ sequence: this.sequence, receivedAt, vehicleId: vehicle.id });

    const severity: AlertSeverity | undefined = speed > 90 ? 'critical' : temperature > 40 ? 'warning' : undefined;
    if (severity) {
      const message = severity === 'critical'
        ? `superó el límite de velocidad · ${speed} km/h`
        : `temperatura del motor elevada · ${temperature.toFixed(1)} °C`;
      this.alertsSubject.next([
        { id: `alert-${this.sequence}`, vehicleId: vehicle.id, message, severity, createdAt: receivedAt },
        ...this.alertsSubject.value,
      ].slice(0, 12));
    }
  }
}
