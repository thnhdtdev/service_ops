export function normalizePhone(phone: string): string {
    let normalized = phone.replace(/\D/g, "");

    if(normalized.startsWith("84") && normalizePhone.length === 11){
            normalized = `0${normalized.slice(2)}`;
    }

    return normalized;
}