import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import {
  AuthService,
  LoginDto,
  loginSchema,
  RegisterDto,
  registerSchema,
  ForgotPasswordDto,
  forgotPasswordSchema,
  ResetPasswordDto,
  resetPasswordSchema,
  VerifyAccountDto,
  verifyAccountSchema,
} from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { toSafeUser } from './dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(new ZodValidationPipe(registerSchema)) registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    if (result.user) {
      result.user = toSafeUser(result.user);
    }
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ZodValidationPipe(loginSchema)) loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    if (result.user) {
      result.user = toSafeUser(result.user);
    }
    return result;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body(new ZodValidationPipe(forgotPasswordSchema)) forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body(new ZodValidationPipe(resetPasswordSchema)) resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body(new ZodValidationPipe(verifyAccountSchema)) verifyDto: VerifyAccountDto) {
    return this.authService.verifyAccount(verifyDto);
  }
}
