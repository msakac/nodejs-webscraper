const PORT = 8000
const axios = require('axios')
const express = require('express')
const app = express()
const cors = require('cors')
const scrapeSuperSport = require('./Scrapers/SuperSport');
const scrapePsk = require('./Scrapers/Psk');
const scrapeGermania = require('./Scrapers/Germania');
const scrapeArena = require('./Scrapers/Arena');
const scrapeCrobet = require('./Scrapers/Crobet');
const dohvatiKladionice = require('./Scrapers/Kladionice');

app.use(cors())

app.get('/psk', (req, res) => {
    scrapePsk().then((data) => {
        res.json(data);
    });
});

app.get('/germania', (req, res) => {
    scrapeGermania().then((data) => {
        res.json(data);
    });
});

app.get('/crobet', (req, res) => {
    scrapeCrobet().then((data) => {
        res.json(data);
    });
});

app.get('/arena', (req, res) => {
    scrapeArena().then((data) => {
        res.json(data);
    });
});

app.get('/supersport', async (req, res) => {
    scrapeSuperSport().then((parovi) => {
        res.json(parovi);
    });
});

app.get('/pokus', async (req, res) => {
    const json = await axios("https://www.germaniasport.hr/betOffer2", {
        "body": "{\"date\":\"2022-12-13\",\"sportIds\":[1],\"competitionIds\":[],\"sort\":\"bycompetition\",\"specials\":null,\"subgames\":[],\"size\":50,\"mostPlayed\":false,\"type\":\"betting\",\"numberOfGames\":0,\"activeCompleteOffer\":false,\"lang\":\"hr\",\"offset\":0}",
        "method": "POST",
    });
    const rawData = json.data;
    let podaci = [];
    rawData.matches.forEach(element => {
        const date = new Date(element.startTime);
        const datum = date.toLocaleString();
        podaci.push({datum});
    });
    res.json(podaci);
});

app.get('/domacin-gostNerjeseno', async (req, res) => {
    let brojacParova = 0;
    dohvatiKladionice().then((kladionice) => {
        kladionice.forEach(kladionica => {
            kladionica.podaci.forEach(par => {
                kladionice.forEach(kladionica2 => {
                    kladionica2.podaci.forEach(par2 => {
                        if (par.domacin == par2.domacin && par.gost == par2.gost) {
                            if (par.koef.domacin != null && par2.koef.gostNerjeseno != null) {
                                const brojDomacin = parseFloat(par.koef.domacin.replace(',', '.'));
                                const brojGostNerjeseno = parseFloat(par2.koef.gostNerjeseno.replace(',', '.'));
                                const roi = izracunajArbitrazu(brojDomacin, brojGostNerjeseno);
                                if (roi > 1 && roi < 40) {
                                    console.log(`${kladionica.naziv} - (1) ${par.domacin} - ${par.koef.domacin} | ${kladionica2.naziv} - (X2) ${par2.gost} - ${par2.koef.gostNerjeseno} - ROI: ${roi}%`)
                                }
                            }
                            if (par.koef.gost != null && par2.koef.domacinNerjeseno != null) {
                                const brojGost = parseFloat(par.koef.gost.replace(',', '.'));
                                const brojDomacinNerjesno = parseFloat(par2.koef.domacinNerjeseno.replace(',', '.'));
                                const roi = izracunajArbitrazu(brojGost, brojDomacinNerjesno);
                                if (roi > 1 && roi < 40) {
                                    console.log(`${kladionica.naziv} - (2) ${par.domacin} - ${par.koef.gost} | ${kladionica2.naziv} - (1X) ${par2.gost} - ${par2.koef.domacinNerjeseno} - ROI: ${roi}%`)
                                }
                            }
                            if (par.koef.nerjeseno != null && par2.koef.domacinGost != null) {
                                const brojNerjeseno = parseFloat(par.koef.nerjeseno.replace(',', '.'));
                                const brojDomacinGost = parseFloat(par2.koef.domacinGost.replace(',', '.'));
                                const roi = izracunajArbitrazu(brojNerjeseno, brojDomacinGost);
                                if (roi > 1 && roi < 40) {
                                    console.log(`${kladionica.naziv} - (X) ${par.domacin} - ${par.koef.nerjeseno} | ${kladionica2.naziv} - (12) ${par2.gost} - ${par2.koef.domacinGost} - ROI: ${roi}%`)
                                }
                            }
                            brojacParova++;
                        }
                    });
                });
            });
        });
        res.json(brojacParova);
    });
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

function izracunajArbitrazu(koef1, koef2) {
    const ulog = 100;
    const stakeBet1 = ulog / (koef1 + koef2) * koef2;
    const stakeBet2 = ulog / (koef1 + koef2) * koef1;
    const payoutBet1 = koef1 * stakeBet1;
    const payoutBet2 = koef2 * stakeBet2;
    const roi = ((payoutBet1 / ulog - 1) * 100).toFixed(2);
    return roi;
}


