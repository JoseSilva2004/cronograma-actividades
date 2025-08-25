// src/utils/helpers.ts

/**
 * Formatea valores nulos o indefinidos para mostrar un guión en la UI
 * @param value Valor a formatear
 * @returns Valor formateado o guión si es nulo/indefinido
 */
export const formatNullableValue = (
  value: string | null | undefined
): string => {
  if (
    value === null ||
    value === undefined ||
    value === "NULL" ||
    value === "null" ||
    value.trim() === ""
  ) {
    return "—";
  }
  return value;
};

/**
 * Verifica si un valor es considerado nulo para la aplicación
 * @param value Valor a verificar
 * @returns true si el valor es nulo/indefinido/vacío
 */
export const isNullOrEmpty = (value: string | null | undefined): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "" || value === "NULL" || value === "null";
  }

  return false;
};
