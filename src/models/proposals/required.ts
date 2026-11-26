import { z } from 'zod';

/**
 * A value the form can hold as null (not chosen yet, or missing from the saved proposal) but that
 * is required to be valid. Null is only allowed to satisfy TypeScript when we first have to create
 * the field with a temporary null value.
 */
export const required = <T extends z.ZodType>(schema: T) =>
  z.custom<z.input<T> | null>().pipe(schema as z.ZodType<z.output<T>, z.input<T> | null>);
