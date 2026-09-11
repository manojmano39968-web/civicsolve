import { getDatabase } from '../database/index.js';
import { Category, Service } from '@civicsolve/shared';

export class TaxonomyRepository {
  private db = getDatabase();

  async getCategories(): Promise<Category[]> {
    const sql = `
      SELECT c.*, COUNT(s.id) as service_count
      FROM categories c
      LEFT JOIN services s ON s.category_id = c.id AND s.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `;
    const result = await this.db.query(sql);
    return result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      icon: row.icon,
      description: row.description,
      sortOrder: row.sort_order,
      isActive: Boolean(row.is_active),
      serviceCount: parseInt(row.service_count || '0', 10),
    }));
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const sql = `SELECT * FROM categories WHERE slug = $1 AND is_active = 1`;
    const result = await this.db.query(sql, [slug]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      icon: row.icon,
      description: row.description,
      sortOrder: row.sort_order,
      isActive: Boolean(row.is_active),
    };
  }

  async getServices(categorySlug?: string): Promise<Service[]> {
    let sql = `
      SELECT s.*, c.slug as category_slug, c.name as category_name
      FROM services s
      JOIN categories c ON c.id = s.category_id
      WHERE s.is_active = 1
    `;
    const params: any[] = [];

    if (categorySlug) {
      sql += ` AND c.slug = $1`;
      params.push(categorySlug);
    }

    sql += ` ORDER BY s.name ASC`;
    const result = await this.db.query(sql, params);
    
    // Fetch aliases for all active services
    const aliasSql = `SELECT service_id, alias FROM service_aliases ORDER BY weight DESC`;
    const aliasResult = await this.db.query(aliasSql);
    
    const aliasMap = new Map<string, string[]>();
    for (const r of aliasResult.rows) {
      const existing = aliasMap.get(r.service_id) || [];
      existing.push(r.alias);
      aliasMap.set(r.service_id, existing);
    }

    return result.rows.map(row => ({
      id: row.id,
      categoryId: row.category_id,
      categorySlug: row.category_slug,
      categoryName: row.category_name,
      slug: row.slug,
      name: row.name,
      icon: row.icon,
      description: row.description,
      defaultPricingUnit: row.default_pricing_unit,
      isActive: Boolean(row.is_active),
      aliases: aliasMap.get(row.id) || [],
    }));
  }
}
