const fs = require('fs')
const cheerio = require('cheerio')
const axios = require('axios')

const scrapeGermania = async () => {
    return new Promise((resolve, reject) => {
        let parovi = [];
        let brojUtakmica = 0;
        //citam html iz txt filea
        fs.readFile('germania.txt', 'utf8', (err, fileData) => {
            if (err) {
                console.log(err);
                return;
            }
            //parsiram html
            const $ = cheerio.load(fileData);
            //trazim sve divove sa klasom match
            $('div .match', fileData).each(function () {
                const divMatch = $(this);
                let domacin, gost;
                let koef = {};
                //trazim sve divove sa klasom sp-mark koja oznaca da se radi o specijalnoj ponudi
                const specijalnaPonuda = divMatch.find('.sp-mark').text();
                //ako nema specijalne ponude mogu obraditi podatke
                if (specijalnaPonuda == '') {
                    let podaciUtakmice = [];
                    //iteriram se kroz sve spanove i nutra stavljam sve tekstove koji su u njima
                    $('span', divMatch).each(function () {
                        span = $(this);
                        podaciUtakmice.push(span.text());
                    });
                    //postavljanje potrebnih podataka
                    domacin = podaciUtakmice[2];
                    gost = podaciUtakmice[3];
                    koef = {
                        domacin: podaciUtakmice[4],
                        nerjeseno: podaciUtakmice[6],
                        gost: podaciUtakmice[8],
                        domacinNerjeseno: podaciUtakmice[10],
                        gostNerjeseno: podaciUtakmice[14],
                        domacinGost: podaciUtakmice[12],
                    }
                    //console.log(podaciUtakmice);
                }
                if (domacin != null && gost != null && koef != null) {
                    brojUtakmica++;
                    parovi.push({ domacin, gost, koef });
                }
            })
            console.log('Broj utakmica Germania: ' + brojUtakmica);
            resolve(parovi);
        });
    });
}

module.exports = scrapeGermania;