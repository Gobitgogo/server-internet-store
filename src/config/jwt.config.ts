import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

//import { registerAs } from '@nestjs/config';

export const getJwtConfig = async (
  config: ConfigService,
): Promise<JwtModuleOptions> => ({
  secret: config.get('JWT_SECRET'),
});

// export default registerAs('jwt', async () => ({
//   JWR_SECRET: process.env.JWR_SECRET,
// }));
