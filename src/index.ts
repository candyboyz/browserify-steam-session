import { SteamTotp } from './lib/steamtotp';

const getCode = async () => {
  const code = await new SteamTotp().generateSteamTotp(
    'uB08PvpZey9gnlgjywrQbIr3dcc='
  );

  console.log(code);
};

getCode();
