import { DatePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DeviceSidebar } from './components/device-sidebar/device-sidebar';
import { LiveMap } from './components/live-map/live-map';
import { MetricsCards } from './components/metrics-cards/metrics-cards';
import { DashboardTheme } from './models/telemetry';
import { TelemetryService } from './services/telemetry.service';

@Component({
  selector: 'app-root',
  imports: [DatePipe, DeviceSidebar, LiveMap, MetricsCards, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {
  private readonly telemetryService = inject(TelemetryService);
  readonly vehicles = toSignal(this.telemetryService.vehicles$, { initialValue: [] });
  readonly alerts = toSignal(this.telemetryService.alerts$, { initialValue: [] });
  private readonly latestTelemetry = toSignal(this.telemetryService.telemetry$, {
    initialValue: { sequence: 0, receivedAt: new Date(), vehicleId: 'veh-04' },
  });
  readonly selectedId = signal('veh-04');
  readonly theme = signal<DashboardTheme>('dark');
  readonly latestSequence = computed(() => this.latestTelemetry().sequence);
  readonly latestReceivedAt = computed(() => this.latestTelemetry().receivedAt);

  toggleTheme(): void {
    this.theme.update(theme => theme === 'dark' ? 'light' : 'dark');
  }

  selectVehicle(vehicleId: string): void {
    this.selectedId.set(vehicleId);
  }
}
