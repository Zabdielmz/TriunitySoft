export interface ContactRequest {
  name: string
  email: string
  category: string
  message: string
}

// Sustituye esta función por fetch('/api/contact', ...) o un proveedor de formularios.
// Nunca coloques claves privadas de Resend u otro servicio en el navegador.
export async function submitContactMock(request: ContactRequest): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 850))
  if (request.email.toLowerCase() === 'demo-error@example.com') {
    throw new Error('Error de demostración')
  }
}
