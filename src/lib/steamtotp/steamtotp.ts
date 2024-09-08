import { Buffer } from 'buffer';

class SteamTotp {
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

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const hmac = await crypto.subtle.sign('HMAC', cryptoKey, buffer);
    const hmacResult = new Uint8Array(hmac);

    const start = hmacResult[hmacResult.length - 1] & 0x0f;
    let material =
      ((hmacResult[start] & 0x7f) << 24) |
      ((hmacResult[start + 1] & 0xff) << 16) |
      ((hmacResult[start + 2] & 0xff) << 8) |
      (hmacResult[start + 3] & 0xff);

    let code = '';
    for (let i = 0; i < this.DIGITS; i++) {
      code += this.ALPHABET[material % this.ALPHABET.length];
      material = Math.floor(material / this.ALPHABET.length);
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

export default new SteamTotp();
