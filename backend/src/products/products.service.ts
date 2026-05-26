import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { search, category, inStockOnly } = query;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'Все') {
      where.category = category;
    }

    if (inStockOnly === 'true') {
      where.inStock = true;
    }

    return this.prisma.product.findMany({ where });
  }

  async getCategories() {
    const products = await this.prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    const categories = products.map((p) => p.category);
    return ['Все', ...categories];
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async createContactRequest(data: { name: string; phone: string; message?: string; type: string }) {
    return this.prisma.contactRequest.create({ data });
  }

  // Админские методы
  async getContactRequests() {
    return this.prisma.contactRequest.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async updateContactStatus(id: number, status: string) {
    return this.prisma.contactRequest.update({ where: { id }, data: { status } });
  }

  async deleteContact(id: number) {
    return this.prisma.contactRequest.delete({ where: { id } });
  }

  async createProduct(data: any) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        category: data.category,
        price: data.price,
        year: parseInt(data.year),
        hp: parseInt(data.hp),
        image: data.image,
        inStock: data.inStock === true || data.inStock === 'true',
        description: data.description,
        specs: typeof data.specs === 'string' ? JSON.parse(data.specs) : data.specs,
      },
    });
  }

  async updateProduct(id: number, data: any) {
    return this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        price: data.price,
        year: parseInt(data.year),
        hp: parseInt(data.hp),
        image: data.image,
        inStock: data.inStock === true || data.inStock === 'true',
        description: data.description,
        specs: typeof data.specs === 'string' ? JSON.parse(data.specs) : data.specs,
      },
    });
  }

  async deleteProduct(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}