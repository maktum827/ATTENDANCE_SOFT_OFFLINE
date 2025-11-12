export function getCurrentLang(req) {
    return req.cookies.lang || 'en';
}
