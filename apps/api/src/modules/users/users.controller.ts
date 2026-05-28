import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private maskDocumentNumber(value?: string | null) {
    if (!value) return null;
    const cleaned = value.trim();
    if (cleaned.length <= 4) return '*'.repeat(cleaned.length);
    return `${'*'.repeat(cleaned.length - 4)}${cleaned.slice(-4)}`;
  }

  @Get('me')
  async getMe(@CurrentUser() user: any) {
    const userDoc = await this.usersService.findById(user.sub);
    if (!userDoc) return null;

    const { passwordHash, documentNumber, ...safeUser } = userDoc as any;
    return {
      ...safeUser,
      documentNumber: this.maskDocumentNumber(documentNumber),
    };
  }

  @Patch('profile')
  async updateProfile(@CurrentUser() user: any, @Body() body: any) {
    const allowedUserFields = ['fullName', 'phone', 'bio', 'avatarUrl'];
    const allowedProviderFields = [
      'businessName',
      'specialty',
      'experienceYears',
      'availability',
      'serviceZone',
      'description',
    ];

    const userData: any = {};
    allowedUserFields.forEach((field) => {
      if (body[field] !== undefined) userData[field] = body[field];
    });

    const providerData: any = {};
    if (body.providerProfile) {
      allowedProviderFields.forEach((field) => {
        if (body.providerProfile[field] !== undefined) {
          providerData[field] = body.providerProfile[field];
        }
      });
    }

    const updatedUser = await this.usersService.updateProfile(user.sub, {
      ...userData,
      providerProfile:
        Object.keys(providerData).length > 0 ? providerData : undefined,
    });

    const { passwordHash, documentNumber, ...safeUser } = updatedUser as any;
    return {
      ...safeUser,
      documentNumber: this.maskDocumentNumber(documentNumber),
    };
  }

  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      user.sub,
      dto.currentPassword,
      dto.newPassword,
      dto.confirmNewPassword,
    );
  }

  @Get(':id/public-profile')
  async getPublicProfile(@Param('id') id: string) {
    const userDoc = await this.usersService.findById(id);
    if (!userDoc) return null;

    return {
      id: userDoc.id,
      fullName: userDoc.fullName,
      role: userDoc.role,
      avatarUrl: userDoc.avatarUrl,
      bio: userDoc.bio,
      trustScore: userDoc.trustScore,
      createdAt: userDoc.createdAt,
    };
  }
}
