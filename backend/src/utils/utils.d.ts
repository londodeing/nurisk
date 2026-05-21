/**
 * Utility function to generate unique codes for entities
 */
declare module './generateCode' {
  export default function generateCode(kabupaten: string): string
}

/**
 * Email utility using Nodemailer
 */
declare module './email' {
  export function createTransporter(): any
  export function sendEmail(options: {
    from?: string
    to: string
    subject: string
    text?: string
    html?: string
  }): Promise<void>
}