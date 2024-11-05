use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = "getId")]
pub fn get_id() -> String {
    "hello".to_string()
}
