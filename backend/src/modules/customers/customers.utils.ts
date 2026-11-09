export function normalizePhone(phone: string): string {
    let normalized = phone.replace(/\D/g, "");

    if(normalized.startsWith("84") && normalized.length === 11){
            normalized = `0${normalized.slice(2)}`;
    }

    return normalized;
}

// "yen 202"      -> { name: "yen", digits: "202" }
// "0901 234 202" -> { name: null, digits: "0901234202" }
// "Yến Nhi"      -> { name: "Yến Nhi", digits: null }
// Words made only of digits are phone digits, the other words are the name.
export function splitCustomerSearch(query: string): {
    name: string | null;
    digits: string | null;
} {
    const words = query.trim().split(/\s+/);
    const nameWords = words.filter((word) => !/^\d+$/.test(word));
    const digits = words.filter((word) => /^\d+$/.test(word)).join("");

    return {
        name: nameWords.length > 0 ? nameWords.join(" ") : null,
        // Same rule as saved phones: "84901234202" -> "0901234202".
        digits: digits ? normalizePhone(digits) : null,
    };
}
