import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';

// Use /tmp in serverless (Vercel), ./uploads locally
const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const uploadBasePath = isServerless ? '/tmp/uploads' : './uploads';

@Injectable()
export class UploadService {
  private readonly uploadPath = uploadBasePath;
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  constructor() {
    // Crear la carpeta de uploads si no existe (seguro para serverless)
    try {
      if (!existsSync(this.uploadPath)) {
        mkdirSync(this.uploadPath, { recursive: true });
      }
    } catch {
      // Silently ignore — directory creation may fail in read-only environments
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
