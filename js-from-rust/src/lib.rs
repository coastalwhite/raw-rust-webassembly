#[cfg(not(test))]
extern {
    fn append_display_i32(a: i32);
}

const NUM_PRIMES: usize = 100;

fn get_primes() -> [i32; NUM_PRIMES] {
    let mut primes = [0; NUM_PRIMES];
    primes[0] = 2;
    primes[1] = 3;

    for i in 2..NUM_PRIMES {
        let mut possible_next = primes[i - 1] + 2;
        'p_loop: loop {
            for j in 0..i {
                if primes[j] > possible_next / 2 {
                    break;
                }

                if possible_next % primes[j] == 0 {
                    possible_next += 2;
                    continue 'p_loop;
                }
            }

            primes[i] = possible_next;
            break;
        }
    }

    primes
}

#[cfg(not(test))]
#[no_mangle]
pub extern fn display_primes() {
    let primes = get_primes();

    for i in 0..NUM_PRIMES {
        unsafe { append_display_i32(primes[i]) };
    }
}

#[test]
fn fetch_primes() {
    let primes = get_primes();
    assert_eq!(primes[0], 2);
    assert_eq!(primes[1], 3);
    assert_eq!(primes[2], 5);
    assert_eq!(primes[3], 7);
}
