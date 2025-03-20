import { validate } from "class-validator";

export async function validateEntity<T extends object>(
  entity: T
): Promise<{ ok: boolean; errors: string[] }> {
  const errors = await validate(entity);
  if (errors.length > 0) {
    const errorMessages = errors.flatMap((error) =>
      Object.values(error.constraints || {})
    );
    return { ok: false, errors: errorMessages };
  }
  return { ok: errors.length === 0, errors: errors.map((e) => e.toString()) };
}
