use sonyflake::Sonyflake;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet() -> String {
    let sf = Sonyflake::new().unwrap();
    sf.next_id().unwrap().to_string()
}
