function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function escapeJs(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/</g, '\\x3C')
        .replace(/>/g, '\\x3E');
}

function sanitizeForAttribute(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

if (typeof window !== 'undefined') {
    window.escapeHtml = escapeHtml;
    window.escapeJs = escapeJs;
    window.sanitizeForAttribute = sanitizeForAttribute;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { escapeHtml, escapeJs, sanitizeForAttribute };
}