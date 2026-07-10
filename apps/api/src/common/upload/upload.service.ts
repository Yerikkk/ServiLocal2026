import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class UploadService {
  private readonly uploadPath = './uploads';
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  constructor() {
    // Crear la carpeta de uploads si no existe
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  getStorage() {
    return diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });
  }

  validateFile(file: Express.Multer.File) {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de archivo no permitido');
    }
  }

  getMulterOptions() {
    return {
      storage: this.getStorage(),
      fileFilter: (req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
        try {
          this.validateFile(file);
          cb(null, true);
        } catch (error) {
          cb(error as Error, false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    };
  }
}
