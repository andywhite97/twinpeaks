import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

@NgModule({ imports: [BrowserTestingModule], providers: [provideZonelessChangeDetection()] })
class ZonelessTestingModule {}
getTestBed().initTestEnvironment(ZonelessTestingModule, platformBrowserTesting(), {
  errorOnUnknownElements: true, errorOnUnknownProperties: true,
});
