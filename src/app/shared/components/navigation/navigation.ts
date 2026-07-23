import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation {
  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  closeMenuAndNavigate(): void {
    this.closeMenu();
    // Collapse Bootstrap navbar as well
    const navbarCollapse = document.getElementById('primaryNavbarCollapse');
    if (navbarCollapse?.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
    }
  }
}
