import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TelemetryAlert, VehicleTelemetry } from '../../models/telemetry';

@Component({
  selector: 'app-metrics-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="Métricas de flota" class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <article class="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm sm:p-5">
        <span class="grid size-11 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-emerald-400" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" class="size-5"><path d="M5 16.5h14l-1.4-6.1a2 2 0 0 0-2-1.5H8.4a2 2 0 0 0-2 1.5L5 16.5Zm2 0v2m10-2v2M7 12h10M8 8l1-2h6l1 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <div class="min-w-0">
          <p class="text-xs font-medium text-slate-400">Vehículos activos</p>
          <p class="mt-1 font-mono text-2xl font-semibold tracking-tight text-slate-50">{{ onlineCount() }}<span class="ml-1.5 text-sm font-normal text-slate-500">/ {{ vehicles().length }}</span></p>
        </div>
        <span class="ml-auto hidden rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 sm:inline-flex">En línea</span>
      </article>

      <article class="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm sm:p-5">
        <span class="grid size-11 shrink-0 place-items-center rounded-lg bg-sky-400/10 text-sky-400" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" class="size-5"><path d="M12 3v2m0 14v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M3 12h2m14 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
        </span>
        <div class="min-w-0">
          <p class="text-xs font-medium text-slate-400">Temperatura promedio</p>
          <p class="mt-1 font-mono text-2xl font-semibold tracking-tight text-slate-50">{{ averageTemperature() }}<span class="ml-1 text-sm font-normal text-slate-400">°C</span></p>
        </div>
        <span class="ml-auto hidden text-xs text-slate-500 sm:inline-flex">Motor</span>
      </article>

      <article class="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm sm:p-5">
        <span class="grid size-11 shrink-0 place-items-center rounded-lg bg-rose-400/10 text-rose-400" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" class="size-5"><path d="M12 8v4m0 4h.01M10.3 4.9 2.9 18a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.9a2 2 0 0 0-3.4 0Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <div class="min-w-0">
          <p class="text-xs font-medium text-slate-400">Alertas críticas</p>
          <p class="mt-1 font-mono text-2xl font-semibold tracking-tight text-slate-50">{{ criticalAlerts() }}</p>
        </div>
        <span class="ml-auto hidden rounded-full bg-rose-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-400 sm:inline-flex">Requiere atención</span>
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
