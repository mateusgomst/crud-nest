import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post('register-admin')
  registerAdmin(@Body() dto: RegisterDto) {
    return this.authService.registerAdmin(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@Req() req: { user: unknown }) {
    return req.user;
  }
}
