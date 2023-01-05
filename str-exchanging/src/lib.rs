use std::slice;

#[no_mangle]
pub extern fn malloc(size: usize) -> *const u8 {
    Vec::with_capacity(size).leak().as_ptr() as *const u8
}

#[no_mangle]
pub extern fn free(ptr: *mut u8, size: usize) {
    unsafe { Vec::from_raw_parts(ptr, 0, size) };
}

#[export_name = "count_digits"]
pub extern fn cnt_dgts(ptr: *const u8, len: usize) -> usize {
    let string = unsafe {
        let bytes = slice::from_raw_parts(ptr, len);
        std::str::from_utf8_unchecked(bytes)
    };

    count_digits(string)
}

#[no_mangle]
pub extern fn static_stringy(addr: &mut *const u8, len: &mut usize) {
    static STATIC_STR: &str = "Wow! A &str from Rust";

    *addr = STATIC_STR.as_ptr() as *const u8;
    *len = STATIC_STR.len();
}

#[no_mangle]
pub extern fn other_static_stringy(addr: &mut *const u8, len: &mut usize) {
    static STATIC_STR: &str = "Another string! Wowie!!!";

    *addr = STATIC_STR.as_ptr() as *const u8;
    *len = STATIC_STR.len();
}

fn count_digits(s: &str) -> usize {
    s.chars().filter(|c| c.is_digit(10)).count() as usize
}
