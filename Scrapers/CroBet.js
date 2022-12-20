const fs = require('fs')
const cheerio = require('cheerio')
const axios = require('axios')

const scrapeCroBet = async () => {
    return new Promise((resolve, reject) => {
        let parovi = [];
        let brojUtakmica = 0;
        //cita html iz txt filea
        fs.readFile('crobet.txt', 'utf8', (err, fileData) => {
            if (err) {
                console.log(err);
                return;
            }
            const $ = cheerio.load(fileData);
            //trazim sve retke tablice koji imaju klasu event
            $('tr', fileData).each(function () {
                let domacin, gost;
                let koef = {};
                const trEvent = $(this);
                //trazim samo retke koji imaju jedino klasu event jer su to utakmice
                if (trEvent.hasClass("event") && !trEvent.hasClass("solo")) {
                    //trazim span koji nema nikakvu klasu jer je to naslov
                    $('span', trEvent).each(function () {
                        const span = $(this);
                        //izvlacim van gosta i domacina
                        if (!span.hasClass('time') && !span.hasClass('icons') && span.text().length > 5) {
                            const timovi = span.text().split('-');
                            domacin = timovi[0];
                            gost = timovi[1];
                        }
                    });
                    //vadim van sve koeficijente
                    let koeficijenti = [];
                    $('div .odd', trEvent).each(function () {
                        const div = $(this);
                        koeficijenti.push(div.text());
                    });
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
                    parovi.push({ domacin, gost, koef });
                    brojUtakmica++;
                }
            })
            console.log('Broj utakmica CroBet: ' + brojUtakmica);
            resolve(parovi);
        });
    });
};

module.exports = scrapeCroBet;