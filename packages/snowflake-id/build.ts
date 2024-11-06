import { execSync } from 'child_process'

execSync('wasm-pack build --release -d dist --no-pack --target nodejs', {
  stdio: 'inherit'
})
