import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { VehicleTelemetry } from '../../models/telemetry';

@Component({
  selector: 'app-device-sidebar',
  imports: [UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside aria-label="Dispositivos de la flota" class="flex min-h-[22rem] flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 lg:h-full">
      <div class="flex items-center justify-between border-b border-slate-800 px-4 py-4">
        <div>
          <h2 class="text-sm font-semibold text-slate-100">Dispositivos</h2>
          <p class="mt-0.5 text-xs text-slate-500">Telemetría de la flota</p>
        </div>
        <span class="rounded-md border border-slate-700 px-2 py-1 font-mono text-xs text-slate-300">{{ vehicles().length.toString().padStart(2, '0') }}</span>
      </div>

      <label class="relative mx-3 mt-3">
        <span class="sr-only">Buscar dispositivo</span>
        <svg viewBox="0 0 24 24" fill="none" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
        <input [value]="query()" (input)="updateQuery($event)" placeholder="Buscar unidad..." class="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-2 pl-9 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
      </label>

      <div class="mt-3 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
        @for (vehicle of filteredVehicles(); track vehicle.id) {
          <button type="button" (click)="deviceSelected.emit(vehicle.id)" [attr.aria-pressed]="selectedId() === vehicle.id" class="w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" [class.border-sky-500/40]="selectedId() === vehicle.id" [class.bg-sky-500/10]="selectedId() === vehicle.id" [class.border-transparent]="selectedId() !== vehicle.id" [class.hover:bg-slate-800/80]="selectedId() !== vehicle.id">
            <span class="flex items-center justify-between gap-3">
              <span class="flex min-w-0 items-center gap-2.5">
                <span class="relative grid size-8 shrink-0 place-items-center rounded-lg bg-slate-800 text-slate-300">
                  <svg viewBox="0 0 24 24" fill="none" class="size-4"><path d="M5 16.5h14l-1.4-6.1a2 2 0 0 0-2-1.5H8.4a2 2 0 0 0-2 1.5L5 16.5Zm2 0v2m10-2v2M7 12h10M8 8l1-2h6l1 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span class="absolute -right-0.5 -top-0.5 size-2 rounded-full ring-2 ring-slate-900" [class.bg-emerald-400]="vehicle.status === 'online'" [class.bg-slate-600]="vehicle.status === 'offline'"></span>
                </span>
                <span class="min-w-0">
                  <span class="block truncate text-xs font-semibold text-slate-100">{{ vehicle.name }}</span>
                  <span class="mt-0.5 block font-mono text-[10px] text-slate-500">{{ vehicle.id | uppercase }}</span>
                </span>
              </span>
              <span class="text-[10px] font-medium" [class.text-emerald-400]="vehicle.status === 'online'" [class.text-slate-500]="vehicle.status === 'offline'">{{ vehicle.status === 'online' ? 'En línea' : 'Sin conexión' }}</span>
            </span>
            <span class="mt-3 flex items-center justify-between pl-10">
              <span class="flex items-center gap-1.5 text-[10px] text-slate-500">
                <svg viewBox="0 0 24 24" fill="none" class="size-3.5" [class.text-emerald-400]="vehicle.battery > 30" [class.text-amber-400]="vehicle.battery <= 30"><rect x="3" y="7" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><path [attr.d]="'M21 10v4M6 10h' + (vehicle.battery > 65 ? 9 : vehicle.battery > 30 ? 6 : 3)" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                {{ vehicle.battery }}%
              </span>
              <span class="flex items-center gap-1 text-[10px] text-slate-500" aria-label="Intensidad de señal">
                <span class="flex h-3 items-end gap-0.5" aria-hidden="true">
                  <i class="h-1 w-0.5 rounded-full" [class.bg-sky-400]="vehicle.signal >= 1" [class.bg-slate-700]="vehicle.signal < 1"></i>
                  <i class="h-1.5 w-0.5 rounded-full" [class.bg-sky-400]="vehicle.signal >= 2" [class.bg-slate-700]="vehicle.signal < 2"></i>
                  <i class="h-2 w-0.5 rounded-full" [class.bg-sky-400]="vehicle.signal >= 3" [class.bg-slate-700]="vehicle.signal < 3"></i>
                  <i class="h-3 w-0.5 rounded-full" [class.bg-sky-400]="vehicle.signal >= 4" [class.bg-slate-700]="vehicle.signal < 4"></i>
                </span>
                {{ vehicle.status === 'online' ? 'GPS' : '—' }}
              </span>
            </span>
            @if (selectedId() === vehicle.id) {
              <span class="mt-3 grid grid-cols-2 gap-2 border-t border-slate-700/70 pt-3 pl-10">
                <span>
                  <span class="block text-[9px] uppercase tracking-wider text-slate-500">Velocidad</span>
                  <span class="mt-1 block font-mono text-xs text-slate-200">{{ vehicle.speed }} <span class="text-slate-500">km/h</span></span>
                </span>
                <span>
                  <span class="block text-[9px] uppercase tracking-wider text-slate-500">Temperatura</span>
                  <span class="mt-1 block font-mono text-xs" [class.text-orange-300]="vehicle.temperature >= 38" [class.text-slate-200]="vehicle.temperature < 38">{{ vehicle.temperature.toFixed(1) }} <span class="text-slate-500">°C</span></span>
                </span>
                <span class="col-span-2">
                  <span class="block text-[9px] uppercase tracking-wider text-slate-500">Última ubicación GPS</span>
                  <span class="mt-1 block font-mono text-[10px] text-slate-300">{{ vehicle.latitude.toFixed(4) }}, {{ vehicle.longitude.toFixed(4) }}</span>
                </span>
              </span>
            }
          </button>
        } @empty {
          <p class="px-3 py-8 text-center text-xs text-slate-500">No hay dispositivos con ese nombre.</p>
        }
      </div>
      <div class="flex items-center gap-2 border-t border-slate-800 px-4 py-3 text-[10px] text-slate-500">
        <span class="size-1.5 rounded-full bg-emerald-400"></span>
        Actualización automática cada 2,5 s
      </div>
    </aside>
  `,
})
export class DeviceSidebar {
  readonly vehicles = input.required<VehicleTelemetry[]>();
  readonly selectedId = input.required<string>();
  readonly deviceSelected = output<string>();
  readonly query = signal('');
  readonly filteredVehicles = computed(() => {
    const normalizedQuery = this.query().trim().toLowerCase();
    return this.vehicles().filter(vehicle =>
      `${vehicle.id} ${vehicle.name}`.toLowerCase().includes(normalizedQuery),
    );
  });

  updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
