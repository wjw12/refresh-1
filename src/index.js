
//import * as p5 from 'p5';

const axios = require('axios');

const baseApi = 'https://geo-wave.vercel.app/api/';

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');


function clamp(value, min, max) {
    if (value < min)
        value = min;
    else if (value > max)
        value = max;
    return value;
}

function repeat(t, length){
    return clamp(t - Math.floor(t / length) * length, 0.0, length);
}

function lerp(a, b, t) {
    if (t > 0 && t < 1) t = 3 * t ** 2 - 2 * t ** 3;
    return a + (b - a) * t;
}

function lerpRgb(a, b, t) {
    return {
        r: Math.floor(lerp(a.r, b.r, t)),
        g: Math.floor(lerp(a.g, b.g, t)),
        b: Math.floor(lerp(a.b, b.b, t))
    }
}
function lerpHsl(a, b, t) {
    return {
        h: Math.floor(lerp(a.h, b.h, t)),
        s: Math.floor(lerp(a.s, b.s, t)),
        l: Math.floor(lerp(a.l, b.l, t))
    }
}

function hsl2str(c) {
    return 'hsl(' + Math.floor(c.h) + ',' + Math.floor(c.s) + '%,' + Math.floor(c.l) + '%)';
}

function rgb2str(c) {
    return 'rgb(' + Math.floor(c.r) + ',' + Math.floor(c.g) + ',' + Math.floor(c.b) + ')';
}

let lerpColor = lerpRgb
let color2str = rgb2str;

// const date = new Date();
// const hour = date.getUTCHours();
// const minute = date.getUTCMinutes();
// const utc = hour + minute / 60;

// const offsetRatio = 0.1;
// const bgPos = Math.floor(repeat(width * (utc / 24 + offsetRatio), width));
// const cssStr = bgPos + 'px';
// $( document ).ready(function() {
//     $('#element').css('background-position', cssStr);
// });      


// login - post an ip to database

var request = new XMLHttpRequest();
request.open('GET', 'https://api.ipify.org?format=json', true);
request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    // Success!
    var data = JSON.parse(request.responseText);
    axios.post(baseApi + 'login', {ip: data.ip})
    .then(
        response => {
            console.log(response.data)
        }
    )
    console.log(data.ip);
  } else {

  }
};

request.onerror = function() {
};

request.send();

// $.getJSON('https://api.ipify.org?format=json', function(data){
//     axios.post(baseApi + 'login', {ip: data.ip})
//     .then(
//         response => {
//             console.log(response.data)
//         }
//     )
//     console.log(data.ip);
// });

const width = window.innerWidth;
const height = window.innerHeight;

const maxRay = Math.max(width, height) * 0.1;
const raySegs = 20;
const recentN = 10;

const refreshInterval = 2000;
const showTime = 10000;
const now = Date.now();

let ipList = sessionStorage.ipList ? JSON.parse(sessionStorage.ipList) : null;
let locationInfo = sessionStorage.locationInfo ? JSON.parse(sessionStorage.locationInfo) : null;
let hasCache = locationInfo && locationInfo != [];



// const sunLocation = utc / 24 * 100;
// const moonLocation = repeat(utc - 12, 24) / 24 * 100;
// const dawnLocation = (sunLocation + moonLocation) / 2;
// const duskLocation = repeat(dawnLocation + 50, 100);
// const dawnColor = {r: 127, g: 142, b: 152};//lerpColor(darkColor, lightColor, 0.45); // adjust the lerp factor
// const duskColor = {r: 127, g: 142, b: 152};//lerpColor(darkColor, lightColor, 0.25);
// const brighterColor = {r: 186, g: 204, b: 208}; //lerpColor(darkColor, lightColor, 0.75);
// const brighterLocation1 = repeat(sunLocation - 12, 100);
// const brighterLocation2 = repeat(sunLocation + 12, 100);
// const darkerColor = {r: 74, g: 86, b: 101};//lerpColor(darkColor, lightColor, 0.15);
// const darkerLocation1 = repeat(moonLocation - 12, 100);
// const darkerLocation2 = repeat(moonLocation + 12, 100);
// const colorArray = [[moonLocation, darkColor], 
//     [sunLocation, lightColor], 
//     [dawnLocation, dawnColor], 
//     [duskLocation, duskColor],
//     [brighterLocation1, brighterColor],
//     [brighterLocation2, brighterColor],
//     [darkerLocation1, darkerColor],
//     [darkerLocation2, darkerColor]
// ];
// colorArray.sort((a, b) => {return a[0] - b[0]});
// let colorStr = '';
// colorArray.forEach((element) => {
//     colorStr += (color2str(element[1]) + ' ' + element[0] + '%,');
// })
// console.log(colorArray);
// console.log(colorStr);
// const colorAt0 = lerpColor(colorArray[0][1], colorArray[colorArray.length - 1][1], 0.5);

// $('body').css('background', 'linear-gradient(to right, ' + 
//     color2str(colorAt0) + ' 0%, ' +
//     colorStr +
//     color2str(colorAt0) + ' 100%)'
// );


    let walls = [];
    let particles = [];
    let x1off = 0;
    let y1off = 10000;
    let x2off = 0;
    let y2off = 4000;
    let b1;
    let b2;
    let b3;

    class Particle {
        constructor() {
            //this.pos = sk.createVector(width / 2, height / 2);
            this.pos = {x: width / 2, y: height / 2};
            this.rays = [];
            for (let a = 0; a < 360; a += 1) {
                this.rays.push(new Ray(this.pos, a / 180.0 * Math.PI));
            }
        }

        update(x, y) {
            //this.pos.set(x, y);
            this.pos.x = x;
            this.pos.y = y;
            this.rays.forEach((ray) => {ray.pos.x = this.pos.x; ray.pos.y = this.pos.y})
        }

        // look(walls) {
        //     for (let i = 0; i < this.rays.length; i++) {
        //     const ray = this.rays[i];
        //     let closest = null;
        //     let record = Infinity;
        //     for (let wall of walls) {
        //         const pt = ray.cast(wall);
        //         if (pt) {
        //         const d = p5.Vector.dist(this.pos, pt);
        //         if (d < record) {
        //             record = d;
        //             closest = pt;
        //         }
        //         }
        //     }
        //     if (closest) {
        //         // colorMode(HSB);
        //         // stroke((i + frameCount * 2) % 360, 255, 255, 50);
        //         sk.stroke(255, 100);
        //         sk.line(this.pos.x, this.pos.y, closest.x, closest.y);
        //     }
        //     }
        // }

        show(size) {
            ctx.fillStyle = 'white';
            //sk.fill(255);
            ctx.beginPath();
            ctx.ellipse(this.pos.x, this.pos.y, size, size, 0, 0, Math.PI * 2, false);
            ctx.stroke();
            //sk.ellipse(this.pos.x, this.pos.y, size);

            ctx.beginPath();
            ctx.moveTo(this.pos.x, this.pos.y);
            for (let ray of this.rays) {
                ctx.lineTo(this.pos.x + ray.dir.x * width, this.pos.y + ray.dir.y * width);
                ctx.moveTo(this.pos.x, this.pos.y);
                ray.show();
            }
            ctx.stroke();
        }
    }

    class Ray {
        constructor(pos, angle) {
            this.pos = pos;
            this.angle = angle;
            //this.dir = sk.createVector();
            this.dir = {x: Math.cos(angle), y: Math.sin(angle)};
        }

        // lookAt(x, y) {
        //     this.dir.x = x - this.pos.x;
        //     this.dir.y = y - this.pos.y;
        //     this.dir.normalize();
        // }

        rotateBy(delta) {
            this.angle += delta;
            this.dir.x = Math.cos(this.angle);
            this.dir.y = Math.sin(this.angle);
        }

        show() {
            // sk.push();
            // sk.stroke(255, 50);
            // sk.translate(this.pos.x, this.pos.y);
            // const delta = maxRay / raySegs;
            // for (let i = 0; i < raySegs; i++) {
            //     sk.stroke(255, (raySegs - i) / raySegs * 100);
            //     sk.line(this.dir.x * delta * i, this.dir.y * delta * i, this.dir.x * delta * (i+1), this.dir.y * delta * (i+1));
            //     //sk.translate(this.dir.x * delta, this.dir.y * delta);
            // }
            // sk.line(0, 0, this.dir.x * width, this.dir.y * width);
            // sk.pop();
        }

    }

    function setup() {

        locationInfo.forEach((element, i) => {
            if (i < recentN) {
                const [y, x] = element.location.coordinates;
                const x_center = Math.floor(repeat(x / 360 * width, width));
                const y_center = Math.floor((90 - y) / 180 * height);
                let particle = new Particle();
                particle.update(x_center, y_center);
                particle.lastTime = element.times[element.times.length - 1];
                particles.push(particle);

            }
        })

    }

    function draw () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // fixed width
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';

        particles.forEach((particle) => {
            if (particle.lastTime > now - showTime) {
                particle.rays.forEach((ray) => {ray.rotateBy(0.0002)});

                // variable width
                ctx.lineWidth = 1.0 - (Date.now() - particle.lastTime) / showTime;

                particle.show(4); // particle size
            }
        });

        requestAnimationFrame(() => {draw();});
        
    }


function drawStuffs() {
    //const P5 = new p5(sketch);
    setup();
    draw();
    
    setTimeout(() => {window.location = window.location}, refreshInterval);
}

if (hasCache) {
    drawStuffs();
}

axios.post(baseApi + 'getIPList').then(
    response => {
        const newIpList = response.data;
        console.log(newIpList);

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
                // sort location info
                newLocationInfo.sort((a, b) => {
                    return b.times[b.times.length - 1] - a.times[a.times.length - 1];
                })
                sessionStorage.locationInfo = JSON.stringify(newLocationInfo);
                locationInfo = newLocationInfo;
                console.log("downloaded", locationInfo);
                if (!hasCache) {
                    drawStuffs();
                }
            })

            sessionStorage.ipList = JSON.stringify(newIpList);
        }
    }
)
.catch(e => {
    console.log(e);
});



  