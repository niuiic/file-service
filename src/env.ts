import { readFileSync } from 'fs'
import { join } from 'path'

const loadEnv = () => {
  const env = JSON.parse(
    readFileSync(join(process.cwd(), 'env.json')).toString()
  )
  Object.entries(env).forEach(
    ([key, value]) => (process.env[key] = String(value))
  )
}
loadEnv()
