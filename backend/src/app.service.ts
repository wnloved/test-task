import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async seed() {
    const count = await this.prisma.product.count();
    if (count > 0) {
      return { message: 'Данные уже существуют', count };
    }

    console.log('start seed')
    const products = [
      {
        name: 'John Deere 8R 410',
        category: 'Тракторы',
        price: '₽12,500,000',
        year: 2024,
        hp: 410,
        image: '/uploads/tractor.jpg',
        inStock: true,
        description: 'Флагманский трактор John Deere 8R с системой автопилота AutoTrac™ и экономичным двигателем PowerTech™ PSX. Идеален для тяжелых полевых работ.',
        specs: { engine: 'PowerTech PSX', transmission: 'e18™ PowerShift', cab: 'CommandView™ III' },
      },
      {
        name: 'CLAAS Lexion 770',
        category: 'Комбайны',
        price: '₽42,000,000',
        year: 2024,
        hp: 790,
        image: '/uploads/combine.jpg',
        inStock: true,
        description: 'Зерноуборочный комбайн CLAAS Lexion 770 с APS-молотилкой и производительностью до 70 тонн зерна в час.',
        specs: { bunker: '14,500 л', header: '12.3 м', engine: 'MAN D4276' },
      },
      {
        name: 'Kverneland LB 85',
        category: 'Почвообработка',
        price: '₽1,850,000',
        year: 2023,
        hp: 150,
        image: '/uploads/plow.jpg',
        inStock: true,
        description: 'Оборотный плуг Kverneland LB 85 с автоматической защитой от камней. Надёжная конструкция для всех типов почв.',
        specs: { bodies: '5', width: '2.0-2.5 м', weight: '1850 кг' },
      },
      {
        name: 'Horsch Pronto 6 DC',
        category: 'Посев',
        price: '₽8,200,000',
        year: 2024,
        hp: 200,
        image: '/uploads/seeder.jpg',
        inStock: false,
        description: 'Комбинированная сеялка Horsch Pronto с технологией прямого посева. Экономит время и топливо.',
        specs: { width: '6 м', hopper: '4500 л', rows: '48' },
      },
      {
        name: 'Amazone UX 5200',
        category: 'Защита растений',
        price: '₽3,950,000',
        year: 2022,
        hp: 180,
        image: '/uploads/sprayer.jpg',
        inStock: true,
        description: 'Самоходный опрыскиватель Amazone UX 5200 с системой AutoSteer. Точное внесение удобрений и средств защиты.',
        specs: { tank: '5200 л', boom: '28 м', clearance: '1.2 м' },
      },
      {
        name: 'Kuhn FC 3525',
        category: 'Косилки',
        price: '₽1,200,000',
        year: 2023,
        hp: 90,
        image: '/uploads/mower.jpg',
        inStock: true,
        description: 'Фронтальная косилка-плющилка Kuhn FC 3525. Чистый срез и равномерное плющение.',
        specs: { width: '3.5 м', discs: '8', weight: '1250 кг' },
      },
      {
        name: 'New Holland T7.315',
        category: 'Тракторы',
        price: '₽14,800,000',
        year: 2024,
        hp: 315,
        image: '/uploads/newholland.jpg',
        inStock: true,
        description: 'Мощный трактор New Holland T7.315 с экономичным двигателем и комфортной кабиной.',
        specs: { engine: 'Cursor 9', transmission: 'Auto Command', cab: 'Horizon Ultra' },
      },
      {
        name: 'Massey Ferguson 8S.265',
        category: 'Тракторы',
        price: '₽11,200,000',
        year: 2023,
        hp: 265,
        image: '/uploads/massey.jpg',
        inStock: true,
        description: 'Универсальный трактор Massey Ferguson 8S с отличной обзорностью и низким расходом топлива.',
        specs: { engine: 'AGCO Power', transmission: 'Dyna-VT', cab: 'Protect' },
      },
    ];

    for (const product of products) {
      await this.prisma.product.create({
        data: product,
      });
    }

    const allProducts = await this.prisma.product.findMany();
    return { message: 'База данных заполнена', count: allProducts.length, products: allProducts };
  }

  async clear() {
    await this.prisma.product.deleteMany();
    return { message: 'База данных очищена' };
  }
}