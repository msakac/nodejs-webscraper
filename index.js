const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const app = express()
const cors = require('cors')
const fs = require('fs')
app.use(cors())

//Scraper za psk dela jer ne koristiju cdn
const urlPsk = 'https://www.psk.hr/oklade/nogomet?selectDates=1&date=2022-12-13'

app.get('/psk', (req, res) => {

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
        res.json(parovi);
    }).catch(err => console.log(err))
});

//Germania scraper
//Germania koristi CDN tak da prek axiosa nebrem scrapat website nego moram ručno kopirat html kod u germania.txt i čitat iz njega
app.get('/germania', (req, res) => {
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
                koef= {
                    domacin: podaciUtakmice[4],
                    nerjeseno: podaciUtakmice[6],
                    gost: podaciUtakmice[8],
                    domacinNerjeseno: podaciUtakmice[10],
                    gostNerjeseno: podaciUtakmice[12],
                    domacinGost: podaciUtakmice[14],
                }
                //console.log(podaciUtakmice);
            }
            if(domacin != null && gost != null && koef != null){
                brojUtakmica++;
                parovi.push({ domacin, gost, koef });
            }
        })
        console.log('Broj utakmica Germania: ' + brojUtakmica);
        res.json(parovi);
    });
});

//Crobet scraper
//Crobet koristi CDN tak da se html rucno kopira i cita iz .txt datoteke
app.get('/crobet', (req, res) => {
    let parovi = [];
    let brojUtakmica = 0;
    //cita html iz txt filea
    fs.readFile('crobet.txt', 'utf8', (err, fileData) => {
        if(err){
            console.log(err);
            return;
        }
        const $ = cheerio.load(fileData);
        //trazim sve retke tablice koji imaju klasu event
        $('tr', fileData).each(function (){
            let domacin,gost;
            let koef = {};
            const trEvent = $(this);
            //trazim samo retke koji imaju jedino klasu event jer su to utakmice
            if(trEvent.hasClass("event") && !trEvent.hasClass("solo")){
                //trazim span koji nema nikakvu klasu jer je to naslov
                $('span', trEvent).each(function (){
                    const span = $(this);
                    //izvlacim van gosta i domacina
                    if(!span.hasClass('time') && !span.hasClass('icons') && span.text().length > 5){
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
            if(domacin != null && gost != null){
                parovi.push({domacin, gost, koef});
                brojUtakmica++;
            }
        })
        console.log('Broj utakmica CroBet: ' + brojUtakmica);
        res.json(parovi);
    });  
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))



