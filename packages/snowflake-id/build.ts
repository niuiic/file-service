import { execSync } from 'child_process'

execSync('wasm-pack build --release --target nodejs', {
  stdio: 'inherit'
})
