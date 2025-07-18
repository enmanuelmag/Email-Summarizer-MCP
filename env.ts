import { z } from 'zod';

const EnvSchema = z.object({
  EMAIL_USER: z.string().email().min(1, 'Email user must be provided'),
  EMAIL_APP_PASSWORD: z.string().min(1, 'Email app password must be provided'),
});

const ENV = EnvSchema.safeParse(process.env);

if (!ENV.success) {
  process.exit(1);
}

export default ENV.data;
