import { Controller, Get, Post, Put, Delete, Body, Query, Param, ParseIntPipe, Res, Headers, HttpException, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ProductsService } from './products.service';
import * as path from 'path';
import * as fs from 'fs';

// Настройка multer для сохранения файлов
const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Проверка токена
  private checkAuth(headers: any) {
    const token = headers['authorization']?.replace('Bearer ', '');
    if (token !== 'admin-token-agrotech-2025') {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Get('categories')
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get('image/:filename')
  async getImage(@Param('filename') filename: string, @Res() res) {
    const uploadsPath = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsPath, filename);
    
    if (!fs.existsSync(filePath)) {
      const placeholderPath = path.join(uploadsPath, 'placeholder.jpg');
      if (fs.existsSync(placeholderPath)) {
        return res.sendFile(placeholderPath);
      }
      return res.status(404).json({ message: 'Image not found' });
    }
    
    return res.sendFile(filePath);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post('contact/callback')
  async requestCallback(@Body() body: { name: string; phone: string; message?: string }) {
    return this.productsService.createContactRequest({ ...body, type: 'call' });
  }

  @Post('contact/question')
  async askQuestion(@Body() body: { name: string; phone: string; message: string }) {
    return this.productsService.createContactRequest({ ...body, type: 'question' });
  }

  // АДМИНСКИЕ ЭНДПОИНТЫ

  @Get('admin/contacts')
  async getContacts(@Headers() headers: any) {
    this.checkAuth(headers);
    return this.productsService.getContactRequests();
  }

  @Put('admin/contacts/:id/status')
  async updateContactStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
    @Headers() headers: any,
  ) {
    this.checkAuth(headers);
    return this.productsService.updateContactStatus(id, body.status);
  }

  @Delete('admin/contacts/:id')
  async deleteContact(@Param('id', ParseIntPipe) id: number, @Headers() headers: any) {
    this.checkAuth(headers);
    return this.productsService.deleteContact(id);
  }

  @Post('admin/product')
  async createProduct(@Body() body: any, @Headers() headers: any) {
    this.checkAuth(headers);
    return this.productsService.createProduct(body);
  }

  @Put('admin/product/:id')
  async updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Headers() headers: any) {
    this.checkAuth(headers);
    return this.productsService.updateProduct(id, body);
  }

  @Delete('admin/product/:id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number, @Headers() headers: any) {
    this.checkAuth(headers);
    return this.productsService.deleteProduct(id);
  }

  @Post('admin/upload-image')
  async uploadImage(@Body() body: { filename: string }, @Headers() headers: any) {
    this.checkAuth(headers);
    // Просто возвращаем имя файла (файл должен быть уже в uploads)
    return { filename: body.filename, url: `/products/image/${body.filename}` };
  }
   @Post('admin/upload')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Headers() headers: any) {
    this.checkAuth(headers);
    
    if (!file) {
      throw new HttpException('Файл не загружен', HttpStatus.BAD_REQUEST);
    }

    return {
      filename: file.filename,
      originalname: file.originalname,
      url: `/products/image/${file.filename}`,
      size: file.size,
    };
  }

  // Список всех файлов в uploads
  @Get('admin/files')
  async getFiles(@Headers() headers: any) {
    this.checkAuth(headers);
    
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      return [];
    }

    const files = fs.readdirSync(uploadPath).map(filename => {
      const filePath = path.join(uploadPath, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        url: `/products/image/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime,
      };
    });

    return files;
  }

  // Удаление файла
  @Delete('admin/files/:filename')
  async deleteFile(@Param('filename') filename: string, @Headers() headers: any) {
    this.checkAuth(headers);
    
    const filePath = path.join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true, message: 'Файл удалён' };
    }
    
    throw new HttpException('Файл не найден', HttpStatus.NOT_FOUND);
  }
  // Переименование файла
@Put('admin/files/:filename/rename')
async renameFile(
  @Param('filename') filename: string,
  @Body() body: { newName: string },
  @Headers() headers: any,
) {
  this.checkAuth(headers);
  
  const uploadPath = path.join(process.cwd(), 'uploads');
  const oldPath = path.join(uploadPath, filename);
  const newPath = path.join(uploadPath, body.newName);
  
  if (!fs.existsSync(oldPath)) {
    throw new HttpException('Файл не найден', HttpStatus.NOT_FOUND);
  }
  
  if (fs.existsSync(newPath)) {
    throw new HttpException('Файл с таким именем уже существует', HttpStatus.CONFLICT);
  }
  
  // Проверяем расширение
  const oldExt = path.extname(filename).toLowerCase();
  const newExt = path.extname(body.newName).toLowerCase();
  
  if (oldExt !== newExt) {
    throw new HttpException('Нельзя менять расширение файла', HttpStatus.BAD_REQUEST);
  }
  
  // Проверяем что имя не содержит опасных символов
  if (/[<>:"/\\|?*]/.test(body.newName)) {
    throw new HttpException('Имя файла содержит недопустимые символы', HttpStatus.BAD_REQUEST);
  }
  
  fs.renameSync(oldPath, newPath);
  
  return {
    success: true,
    oldName: filename,
    newName: body.newName,
    url: `/products/image/${body.newName}`,
  };
}
}