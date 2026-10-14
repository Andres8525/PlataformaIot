import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, effect, inject, input, output, viewChild } from '@angular/core';
import * as L from 'leaflet';
import { DashboardTheme, VehicleTelemetry } from '../../models/telemetry';

@Component({
  selector: 'app-live-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div #mapHost [class.map-dark]="theme() === \'dark\'" class="h-full min-h-[320px] w-full" role="application" aria-label="Mapa de vehículos en tiempo real"></div>',
})
export class LiveMap {
  readonly vehicles = input.required<VehicleTelemetry[]>();
  readonly selectedId = input.required<string>();
  readonly theme = input.required<DashboardTheme>();
  readonly vehicleSelected = output<string>();
  private readonly mapHost = viewChild.required<ElementRef<HTMLDivElement>>('mapHost');
  private readonly destroyRef = inject(DestroyRef);
  private map?: L.Map;
  private tileLayer?: L.TileLayer;
  private readonly markers = new Map<string, L.CircleMarker>();

  constructor() {
    afterNextRender(() => this.initializeMap());
    effect(() => {
      const vehicles = this.vehicles();
      const selectedId = this.selectedId();

      if (!this.map) return;
      this.updateMarkers(vehicles, selectedId);
    });

    this.destroyRef.onDestroy(() => this.map?.remove());
  }

  private initializeMap(): void {
    this.map = L.map(this.mapHost().nativeElement, {
      center: [4.65, -74.08],
      zoom: 12,
      zoomControl: false,
      scrollWheelZoom: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.updateTileLayer();
    this.updateMarkers(this.vehicles(), this.selectedId());
    this.map.invalidateSize();
  }

  private updateTileLayer(): void {
    if (!this.map) return;
    this.tileLayer?.remove();
    this.tileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    ).addTo(this.map);
  }

  private updateMarkers(vehicles: VehicleTelemetry[], selectedId: string): void {
    if (!this.map) return;
    const activeIds = new Set(vehicles.map(vehicle => vehicle.id));

    for (const [id, marker] of this.markers) {
      if (!activeIds.has(id)) {
        marker.remove();
        this.markers.delete(id);
      }
    }

    for (const vehicle of vehicles) {
      const selected = vehicle.id === selectedId;
      const color = vehicle.status === 'offline' ? '#64748b' : selected ? '#0284c7' : '#059669';
      const marker = this.markers.get(vehicle.id);
      if (marker) {
        marker.setLatLng([vehicle.latitude, vehicle.longitude]);
        marker.setStyle({ color, fillColor: color, radius: selected ? 10 : 8 });
        marker.setTooltipContent(`${vehicle.name} · ${vehicle.speed} km/h`);
        this.setMarkerAccessibility(marker, vehicle);
      } else {
        const newMarker = L.circleMarker([vehicle.latitude, vehicle.longitude], {
          radius: selected ? 10 : 8,
          color,
          fillColor: color,
          fillOpacity: 0.95,
          weight: 3,
        }).addTo(this.map);
        newMarker.bindTooltip(`${vehicle.name} · ${vehicle.speed} km/h`, { direction: 'top', offset: [0, -8] });
        newMarker.on('click', () => this.vehicleSelected.emit(vehicle.id));
        this.setMarkerAccessibility(newMarker, vehicle);
        this.markers.set(vehicle.id, newMarker);
      }
    }
  }

  private setMarkerAccessibility(marker: L.CircleMarker, vehicle: VehicleTelemetry): void {
    const element = marker.getElement();
    if (!element) return;
    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');
    element.setAttribute('aria-label', `${vehicle.name}, ${vehicle.speed} kilómetros por hora`);
    if (element.getAttribute('data-keyboard-ready') !== 'true') {
      element.setAttribute('data-keyboard-ready', 'true');
      element.addEventListener('keydown', event => {
        if (event instanceof KeyboardEvent && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          this.vehicleSelected.emit(vehicle.id);
        }
      });
    }
  }
}
