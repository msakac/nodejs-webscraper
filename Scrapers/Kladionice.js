const scrapeSuperSport = require('./SuperSport');
const scrapePsk = require('./Psk');
const scrapeGermania = require('./Germania');
const scrapeArena = require('./Arena');
const scrapeCrobet = require('./Crobet');

const dohvatiKladionice = async () => {
    return new Promise(async (resolve, reject) => {
        let kladionice = [];
        kladionice.push({ naziv: 'Arena', podaci: await scrapeArena() });
        kladionice.push({ naziv: 'Crobet', podaci: await scrapeCrobet() });
        kladionice.push({ naziv: 'Germania', podaci: await scrapeGermania() });
        kladionice.push({ naziv: 'Psk', podaci: await scrapePsk() });
        kladionice.push({ naziv: 'SuperSport', podaci: await scrapeSuperSport() });
        resolve(kladionice);
    });
}

module.exports = dohvatiKladionice;