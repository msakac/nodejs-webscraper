const fs = require('fs')
const cheerio = require('cheerio')
const axios = require('axios')

const scrapeSuperSport = async () => {
    return new Promise((resolve, reject) => {
        let parovi = [];
        let brojUtakmica = 0;

        fs.readFile('supersport.txt', 'utf8', (err, fileData) => {
            if (err) {
                console.log(err);
                return;
            }

            const $ = cheerio.load(fileData);
            $('tr', fileData).each(function () {
                const trPonuda = $(this);
                let domacin, gost;
                let koef = {};
                const spanPonudaNaziv = trPonuda.find('.ponuda-naziv');
                const timovi = [];
                $('span', spanPonudaNaziv).each(function () {
                    span = $(this);
                    if (!span.hasClass('separator') && !span.hasClass('text-pored')) {
                        timovi.push(span.text());
                    }
                });
                domacin = timovi[0];
                gost = timovi[1];
                let koeficijenti = [];
                $('.tecaj-text', trPonuda).each(function () {
                    const divTecajText = $(this);
                    koeficijenti.push(divTecajText.text());
                });
                if (koeficijenti.length > 0) {
                    koef = {
                        domacin: koeficijenti[0],
                        nerjeseno: koeficijenti[1],
                        gost: koeficijenti[2],
                        domacinNerjeseno: koeficijenti[3],
                        gostNerjeseno: koeficijenti[4],
                        domacinGost: koeficijenti[5],
                    }
                }
                if (domacin != null && gost != null) {
                    brojUtakmica++;
                    parovi.push({ domacin, gost, koef });
                }
            });
            console.log('Broj utakmica Supersport: ' + brojUtakmica);
            resolve(parovi);
        });
    });
}

module.exports = scrapeSuperSport;