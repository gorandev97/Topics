import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as Mail from 'nodemailer/lib/mailer';
import { createTransport } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.nodemailerTransport = createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('SERVICE_MAIL'),
        pass: this.configService.get<string>('SERVICE_PASS'),
      },
    });
  }
  public async sendResetPasswordLink(email: string): Promise<void> {
    const payload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: `60s`,
    });

    const url = `${this.configService.get<string>('FRONTEND_URL_RESET')}?token=${token}`;

    const text = `Hi, \nTo reset your password, click here: ${url}`;

    return this.sendMail({
      to: email,
      subject: 'Reset password',
      text,
    });
  }
  private sendMail(options: Mail.Options) {
    return this.nodemailerTransport.sendMail(options);
  }
}
