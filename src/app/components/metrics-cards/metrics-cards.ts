import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TelemetryAlert, VehicleTelemetry } from '../../models/telemetry';

@Component({
  selector: 'app-metrics-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="Indicadores de flota" class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <article class="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
        <p class="text-xs text-slate-500">Vehículos en línea</p>
        <p class="mt-2 font-mono text-2xl font-medium tabular-nums text-slate-100">
          {{ onlineCount() }}<span class="ml-1.5 text-sm text-slate-500">/ {{ vehicles().length }}</span>
        </p>
      </article>
      <article class="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
        <p class="text-xs text-slate-500">Temperatura media</p>
        <p class="mt-2 font-mono text-2xl font-medium tabular-nums text-slate-100">
          {{ averageTemperature() }}<span class="ml-1 text-sm text-slate-500">°C</span>
        </p>
      </article>
      <article class="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
        <p class="text-xs text-slate-500">Alertas críticas</p>
        <p class="mt-2 flex items-center gap-2 font-mono text-2xl font-medium tabular-nums text-slate-100">
          <span class="size-2 rounded-full" [class.bg-rose-700]="criticalAlerts() > 0" [class.bg-slate-500]="criticalAlerts() === 0"></span>
          {{ criticalAlerts() }}
        </p>
      </article>
    </section>
  `,
})
export class MetricsCards {
  readonly vehicles = input.required<VehicleTelemetry[]>();
  readonly alerts = input.required<TelemetryAlert[]>();
  readonly onlineCount = computed(() => this.vehicles().filter(vehicle => vehicle.status === 'online').length);
  readonly averageTemperature = computed(() => {
    const online = this.vehicles().filter(vehicle => vehicle.status === 'online');
    return online.length ? (online.reduce((sum, vehicle) => sum + vehicle.temperature, 0) / online.length).toFixed(1) : '—';
  });
  readonly criticalAlerts = computed(() => this.alerts().filter(alert => alert.severity === 'critical').length);
}
