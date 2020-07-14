const axios = require('axios');

const baseApi = 'https://geo-wave.vercel.app/api/';

$.getJSON('https://api.ipify.org?format=json', function(data){
    axios.post(baseApi + 'login', {ip: data.ip})
    .then(
        response => {
            console.log(response.data)
        }
    )
    console.log(data.ip);
});

const w = window.innerWidth;
const h = window.innerHeight;

let ipList = sessionStorage.ipList ? JSON.parse(sessionStorage.ipList) : null;
let locationInfo = sessionStorage.locationInfo ? JSON.parse(sessionStorage.locationInfo) : null;
let hasCache = locationInfo && locationInfo != [];

let count = 100;

function drawStuffs() {
    $('#main-text').text('');
    locationInfo.forEach((element) => {
        $('#main-text').text(parseInt(element.times) - count);
    })
    count = Math.max(count - 1, 0);

    requestAnimationFrame(() => {drawStuffs()});
    setTimeout(() => {location.reload()}, 5000);
}

if (hasCache) {
    drawStuffs();
}

axios.post(baseApi + 'getIPList').then(
    response => {
        newIpList = response.data;

        if (newIpList) {
            // const waveElements = [];
            const textElements = [];
            const divElements = [];
            const newLocationInfo = [];

            Promise.all(
                newIpList.map(async (ip, idx) => {
                    const resp = await axios.post(baseApi + 'getInfoFromIP', {ip: ip});
                    newLocationInfo.push(resp.data);
                })
            )
            .then(() => {
                sessionStorage.locationInfo = JSON.stringify(newLocationInfo);
                locationInfo = newLocationInfo;
                console.log("downloaded", locationInfo);
                if (!hasCache) {
                    drawStuffs();
                }
            })
        }
    }
)
.catch(e => {
    console.log(e);
});
