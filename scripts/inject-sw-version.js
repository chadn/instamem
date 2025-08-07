// inject-sw-version.js
// Updates the CACHE_NAME in public/sw.js to match the version in package.json

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const swPath = path.join(__dirname, '../public/sw.js')
const pkgPath = path.join(__dirname, '../package.json')

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const version = pkg.version

const swSource = fs.readFileSync(swPath, 'utf8')

const newSwSource = swSource.replace(
    /CACHE_NAME = 'instamem-v\d+\.\d+\.\d+'/, // escape . for regex
    `CACHE_NAME = 'instamem-v${version}'`
)

if (swSource !== newSwSource) {
    fs.writeFileSync(swPath, newSwSource, 'utf8')
    console.log(`Updated sw.js CACHE_NAME to instamem-v${version}`)
} else {
    console.log('sw.js CACHE_NAME already up to date.')
}
