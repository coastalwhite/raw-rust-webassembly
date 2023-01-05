const STRING_OFFSET = 0;
const MAX_STRING_SIZE = 256;

function encode_string(str, memory) {
	if (!("TextEncoder" in window)) {
		throw new Error("No support for TextEncoder");
	}

	const text_encoder = new TextEncoder();

	const memorySize = memory.buffer.byteLength;

	// We cannot even fit our buffer in the memory
	if (STRING_OFFSET + MAX_STRING_SIZE > memorySize) {
		throw new Error("WebAssembly memory too small! Adjust `.cargo/config`");
	}
	
	// Claim memory that will hold the UTF-8 string
	const array = new Uint8Array(
		memory.buffer, STRING_OFFSET, MAX_STRING_SIZE
	);

	// Write UTF-8 form into memory
	const { read, written } = text_encoder.encodeInto(str, array);

	// If our memory did not have enough space, the string is truncated.
	if (read != str.length) {
		alert("String is too big! Truncated string...");
	}

	// Return the address + length of the string in memory
	return [STRING_OFFSET, written];
}

function decode_string(memory, addr, length) {
	if (!("TextDecoder" in window)) {
		throw new Error("No support for TextDecoder");
	}

	const text_decoder = new TextDecoder();
	const array = memory.buffer.slice(addr, addr + length);

	return text_decoder.decode(array);
}

fetch("../target/wasm32-unknown-unknown/release/str_exchanging.wasm")
  .then((response) => response.arrayBuffer())
  .then((bytes) => WebAssembly.instantiate(bytes, { env: {} }))
  .then((results) => {
    let module = {};
    let mod = results.instance;
    module.count_digits = mod.exports.count_digits;
	module.memory = mod.exports.memory;

	function count_digits(s) {
		const [addr, len] = encode_string(s, module.memory);
		return module.count_digits(addr, len);
	}

    function static_stringy() {
        // 2 * 4 bytes = 8 bytes
        const ptr = mod.exports.malloc(8);
	    mod.exports.static_stringy(ptr, ptr + 4);
        const [addr, len] = new Int32Array(module.memory.buffer, ptr, 2);
        const s = decode_string(module.memory, addr, len);
        mod.exports.free(ptr, 8);
        return s;
    }

    function other_static_stringy() {
        // 2 * 4 bytes = 8 bytes
        const ptr = mod.exports.malloc(8);
	    mod.exports.other_static_stringy(ptr, ptr + 4);
        const [addr, len] = new Int32Array(module.memory.buffer, ptr, 2);
        const s = decode_string(module.memory, addr, len);
        mod.exports.free(ptr, 8);
        return s;
    }

	alert(static_stringy());
	alert(other_static_stringy());
	alert(static_stringy());

    const inTextElem = document.getElementById("in_text");
    const answerElem = document.getElementById("answer");

    function recalculate() {
      const inText = inTextElem.value;
      answerElem.innerHTML = count_digits(inText);
    }

    inTextElem.addEventListener("input", recalculate);

    recalculate();
  });