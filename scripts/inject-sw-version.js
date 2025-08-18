// inject-sw-version.js
// Updates the APP_VERSION in public/sw.js to match the version in package.json

const fs = require('fs')
const path = require('path')


const swPath = path.join(__dirname, '../public/sw.js')
const pkgPath = path.join(__dirname, '../package.json')

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const version = pkg.version

const swSource = fs.readFileSync(swPath, 'utf8')

const newSwSource = swSource.replace(
    /APP_VERSION = 'instamem-\d+\.\d+\.[\-\.\d]+'/, // escape . for regex
    `APP_VERSION = 'instamem-${version}'`
)

if (swSource !== newSwSource) {
    fs.writeFileSync(swPath, newSwSource, 'utf8')
    console.log(`Updated sw.js APP_VERSION to instamem-v${version}`)
} else {
    console.log(`sw.js already has APP_VERSION=instamem-v${version}`)
}
