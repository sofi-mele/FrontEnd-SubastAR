import { z } from 'zod';

export const passwordRegex = /^(?![0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_+=\[\]{}|;':",.<>?/`~\\]).{8,}$/;
export const registrationSteps = ['Datos', 'Código', 'Clave', 'Pago'];

export const loginSchema = z.object({
  email: z.email('Ingresá un correo válido.'),
  password: z.string().min(6, 'Mínimo 6 caracteres.'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Ingresá tu nombre.'),
  surname: z.string().min(2, 'Ingresá tu apellido.'),
  email: z.email('Correo inválido.'),
  address: z.string().min(5, 'Ingresá tu domicilio.'),
  country: z.string().min(2, 'Ingresá tu país.'),
});

export const verifySchema = z.object({ code: z.string().min(4, 'Ingresá el código recibido.') });

export const passwordSchema = z.object({
  password: z.string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres.')
    .regex(passwordRegex, 'La contraseña no cumple los requisitos de seguridad.'),
  confirmation: z.string().min(8, 'Confirmá tu contraseña.'),
}).refine((values) => values.password === values.confirmation, { path: ['confirmation'], message: 'Las contraseñas no coinciden.' });

export const forgotPasswordSchema = z.object({ email: z.email('Ingresá un correo valido.') });

export const resetPasswordSchema = z.object({
  code: z.string().min(4, 'Ingresá el código recibido.'),
  password: z.string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres.')
    .regex(passwordRegex, 'La contraseña no cumple los requisitos de seguridad.'),
  confirmation: z.string().min(8, 'Confirma tu contraseña.'),
}).refine((values) => values.password === values.confirmation, { path: ['confirmation'], message: 'Las contraseñas no coinciden.' });
