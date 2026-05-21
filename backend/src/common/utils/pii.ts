// PII Masking Utilities

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return phone;
  return phone.slice(0, 4) + '******' + phone.slice(-2);
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}****@${domain}`;
}

export function maskName(name: string): string {
  if (!name || !name.includes(' ')) return name;
  const parts = name.split(' ');
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function maskDate(date: string): string {
  if (!date) return date;
  return date.slice(0, 7);
}

export function maskNIK(nik: string): string {
  if (!nik || nik.length < 4) return nik;
  return nik.slice(0, 2) + '**********' + nik.slice(-2);
}

export function maskAddress(address: string): string {
  if (!address || address.length < 6) return address;
  return address.slice(0, 6) + '...';
}
