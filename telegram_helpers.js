const getUserLanguage = (languageCode) => {
    return languageCode && languageCode.toLowerCase() === 'es' ? 'spanish' : 'english';
}

module.exports = {
    getUserLanguage
}