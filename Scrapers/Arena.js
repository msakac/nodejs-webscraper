const fs = require('fs')
const cheerio = require('cheerio')
const axios = require('axios');
const { resolve } = require('path');

const scrapeArena = async () => {
    return new Promise((resolve, reject) => {
        let parovi = [];
        let brojUtakmica = 0;

        //citam html iz txt filea
        fs.readFile('arena.txt', 'utf8', (err, fileData) => {
            if (err) {
                console.log(err);
                return;
            }
            const $ = cheerio.load(fileData);
            //moram provjeravati dali se radi o bonus dana ili bonus plus
            $('div .vue-recycle-scroller__item-view', fileData).each(function () {
                const divVue = $(this);
                //dohvacam naslov odjeljka na areni
                const naslov = divVue.find('h2').text();
                //necu parove koji su bonus dana i koji su bonus plus
                if (naslov != 'Bonus dana' && naslov != 'Bonus Plus') {
                    //iteriram se kroz svaki nogometni dogadaj
                    $('div .ggame-item-content', divVue).each(function () {
                        let domacin, gost;
                        let koef = {};
                        const divGameItemContent = $(this);
                        //izvlacim van gosta i domacina
                        $('span', divGameItemContent).each(function () {
                            const span = $(this);
                            if (span.hasClass('first-team')) {
                                const timovi = span.text().split(' - ');
                                domacin = timovi[0];
                                gost = timovi[1];
                            }
                        });
                        let koeficijenti = [];
                        $('div .odd-number', divGameItemContent).each(function () {
                            const divOddChange = $(this).text();
                            //replace sve znakove koji nisu broj ili tocka
                            var koefStripped = divOddChange.replace(/[^\d.]/g, '');
                            koeficijenti.push(koefStripped);
                        });
                        koef = {
                            domacin: koeficijenti[0],
                            nerjeseno: koeficijenti[1],
                            gost: koeficijenti[2],
                            domacinNerjeseno: koeficijenti[3],
                            gostNerjeseno: koeficijenti[4],
                            domacinGost: koeficijenti[5],
                        }
                        if (domacin != null && gost != null) {
                            parovi.push({ domacin, gost, koef });
                            brojUtakmica++;
                        }
                    });
                }
            });
            console.log('Broj utakmica Arena: ' + brojUtakmica);
            resolve(parovi);
        });
    });
};

module.exports = scrapeArena;