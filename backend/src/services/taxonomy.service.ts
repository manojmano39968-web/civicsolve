import { TaxonomyRepository } from '../repositories/taxonomy.repository.js';
import { Category, Service } from '@civicsolve/shared';

export class TaxonomyService {
  private repository = new TaxonomyRepository();

  async getCategories(): Promise<Category[]> {
    return this.repository.getCategories();
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.repository.getCategoryBySlug(slug);
  }

  async getServices(categorySlug?: string): Promise<Service[]> {
    return this.repository.getServices(categorySlug);
  }
}
