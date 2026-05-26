import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { Leader } from '../../shared/models/leader.model';

@Injectable({
  providedIn: 'root',
})
export class LeadershipService {
   constructor(private api: ApiService) {}

  getLeaders() {
    return this.api.get<Leader[]>('leaders/');
  }
}
