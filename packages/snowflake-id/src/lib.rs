use js_sys::Date;
use wasm_bindgen::prelude::*;

const EPOCH: i64 = 1577836800000;
const TIMESTAMP_LEFT_SHIFT: u32 = 22;
const CLUSTER_ID_LEFT_SHIFT: u32 = 17;
const MACHINE_ID_LEFT_SHIFT: u32 = 12;
const SEQUENCE_MASK: i64 = 4095;

#[wasm_bindgen]
pub struct SnowflakeIdGenerator {
    cluster_id: i64,
    machine_id: i64,
    last_timestamp: i64,
    sequence: i64,
}

#[wasm_bindgen]
impl SnowflakeIdGenerator {
    #[wasm_bindgen(constructor)]
    pub fn new(cluster_id: i64, machine_id: i64) -> Self {
        SnowflakeIdGenerator {
            last_timestamp: -1,
            sequence: 0,
            cluster_id,
            machine_id,
        }
    }

    #[wasm_bindgen(js_name = "getId")]
    pub fn get_id(&mut self) -> Result<String, JsValue> {
        let timestamp = self.get_timestamp();
        if self.last_timestamp == timestamp {
            self.sequence = self.sequence + 1;
            if self.sequence > SEQUENCE_MASK {
                return Err(JsValue::from_str("sequence overflow"));
            }
        } else {
            self.sequence = 0;
        }
        self.last_timestamp = timestamp;

        let id = (timestamp << TIMESTAMP_LEFT_SHIFT)
            | (self.cluster_id << CLUSTER_ID_LEFT_SHIFT)
            | (self.machine_id << MACHINE_ID_LEFT_SHIFT)
            | self.sequence;

        Ok(id.to_string())
    }

    fn get_timestamp(&self) -> i64 {
        Date::new_0().get_time() as i64 - EPOCH
    }
}
