const fs = require('fs')
const cheerio = require('cheerio')
const axios = require('axios')

const urlPsk = 'https://www.psk.hr/oklade/nogomet?selectDates=1&date=2022-12-17'


const scrapePsk = async () => {
    return new Promise((resolve, reject) => {

        axios(urlPsk).then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            let parovi = []
            let brojUtakmica = 0;
            //iteriram kroz sve tr elemente
            $('tr', html).each(function () {
                const data = $(this);
                //pronalazim naslov utakmice 
                const utakmica = $(this).find('.col-title').attr('data-value');
                let kvote = [];
                //iteriram se kroz kvote
                $('.col-odds', data).each(function () {
                    const kvota = $(this).find('.odds-button').attr('data-value');
                    if (kvota != null) {
                        kvote.push(kvota);
                    }
                })
                //postavljanje koeficijente
                koef = {
                    domacin: kvote[0],
                    nerjeseno: kvote[1],
                    gost: kvote[2],
                    domacinNerjeseno: kvote[3],
                    gostNerjeseno: kvote[4],
                    domacinGost: kvote[5],
                }
                //ako je utakmica i ako ima kvota dodajem u parove
                if (utakmica != null && kvote.length > 0) {
                    brojUtakmica++;
                    //razdvajam timove
                    const timovi = utakmica.split(' - ');
                    parovi.push({ domacin: timovi[0], gost: timovi[1], koef });
                }
            })
            console.log('Broj utakmica PSK: ' + brojUtakmica);
            resolve(parovi);
        }).catch(err => console.log(err))
    });
};

module.exports = scrapePsk;