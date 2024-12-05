import { execSync } from 'child_process'
import { cpSync } from 'fs'
import { join } from 'path'

const rootDir = process.cwd()
const targetDir = join(rootDir, 'dist')
const configFiles = ['config.json', 'config.mock.json']

execSync('pnpm nest build')
configFiles.forEach((x) => cpSync(join(rootDir, x), join(targetDir, x)))
