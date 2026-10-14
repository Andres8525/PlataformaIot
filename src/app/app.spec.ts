import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the fleet dashboard', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Monitoreo de flota');
    expect(compiled.textContent).toContain('Ubicación de vehículos');
    expect(compiled.textContent).toContain('Actividad reciente');
  });

  it('should switch between dark and light themes', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const app = fixture.componentInstance;
    const compiled = fixture.nativeElement as HTMLElement;

    expect(app.theme()).toBe('dark');
    app.toggleTheme();
    fixture.detectChanges();

    expect(app.theme()).toBe('light');
    expect(compiled.querySelector('main')?.classList.contains('theme-light')).toBe(true);
  });
});
