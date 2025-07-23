import { z } from 'zod';

const EnvSchema = z.object({
  MCP_EMAIL_USER: z.string().email().min(1, 'Email user must be provided'),
  MCP_EMAIL_APP_PASSWORD: z
    .string()
    .min(1, 'Email app password must be provided'),
});

const ENV = EnvSchema.safeParse(process.env);

// if (!ENV.success) {
//   console.error('Invalid environment variables:', ENV.error.format());
//   process.exit(1);
// }

export default ENV.data || ({} as z.infer<typeof EnvSchema>);
