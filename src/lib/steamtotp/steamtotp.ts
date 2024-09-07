import { Buffer } from 'buffer';
import Crypto from 'crypto';

export class SteamTotp {
  private readonly DIGITS = 5;
  private readonly PERIOD = 30;
  private readonly ALPHABET = '23456789BCDFGHJKMNPQRTVWXY';

  getTime(timeOffset?: number) {
    return Math.floor(Date.now() / 1000) + (timeOffset || 0);
  }

  async generateSteamTotp(secret: string, timeOffset = 0) {
    const keyData = this.bufferizeSecret(secret);

    const time = this.getTime(timeOffset) / this.PERIOD;

    const buffer = Buffer.allocUnsafe(8);
    buffer.writeUint32BE(0, 0);
    buffer.writeUint32BE(Math.floor(time / 30), 4);

    const hmac = Crypto.createHmac('sha1', keyData);
    let hmacBuffer = hmac.update(buffer).digest();

    const start = hmac[19] & 0x0f;
    hmacBuffer = hmacBuffer.slice(start, start + 4);

    let fullcode = hmacBuffer.readUInt32BE(0) & 0x7fffffff;

    let code = '';
    for (let i = 0; i < this.DIGITS; i++) {
      code += this.ALPHABET.charAt(fullcode % this.ALPHABET.length);
      fullcode /= this.ALPHABET.length;
    }

    return code;
  }

  private bufferizeSecret(secret: string) {
    if (typeof secret === 'string') {
      if (secret.match(/[0-9a-f]{40}/i)) {
        return Buffer.from(secret, 'hex');
      } else {
        return Buffer.from(secret, 'base64');
      }
    }

    return secret;
  }
}
