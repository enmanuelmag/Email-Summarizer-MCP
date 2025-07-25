import { Logger } from '../utils/logger';

export function handleError(customMessage?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        Logger.error(
          `Error in ${target}.${propertyKey}: ${customMessage ?? ''}`,
          errorMessage
        );
        throw new Error(errorMessage);
      }
    };

    return descriptor;
  };
}
