import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/aura';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { selectedFileReducer } from './core/state/selectedFile/selectedFile.reducer';
import { dataFilesReducer } from './core/state/dataFiles/dataFiles.reducer';
import { definePreset } from '@primeng/themes';
import { dataFiltersReducer } from './core/state/dataFilters/dataFilters.reducer';
import { DataFilesEffects } from './core/state/dataFiles/dataFiles.effects';

const MyPreset = definePreset(Lara, {
  semantic: {
      primary: {
          50: '{indigo.50}',
          100: '{indigo.100}',
          200: '{indigo.200}',
          300: '{indigo.300}',
          400: '{indigo.400}',
          500: '{indigo.500}',
          600: '{indigo.600}',
          700: '{indigo.700}',
          800: '{indigo.800}',
          900: '{indigo.900}',
          950: '{indigo.950}'
      },
      colorScheme: {
        light: {
            surface: {
                0: '#ffffff',
                50: '{gray.50}',
                100: '{gray.100}',
                200: '{gray.200}',
                300: '{gray.300}',
                400: '{gray.400}',
                500: '{gray.500}',
                600: '{gray.600}',
                700: '{gray.700}',
                800: '{gray.800}',
                900: '{gray.900}',
                950: '{gray.950}'
            }
        }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: MyPreset
        },
        ripple: true
    }),
    provideStore({
        'dataFiles': dataFilesReducer,
        'selectedFile': selectedFileReducer,
        'dataFilters': dataFiltersReducer
    }),
    provideEffects(DataFilesEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ]
};
