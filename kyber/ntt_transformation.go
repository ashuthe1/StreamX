package kyber

import (
	"fmt"
	"time"
)

const MOD = 998244353 // A prime modulus of the form c*2^k + 1; suitable for NTT
const ROOT = 3        // A primitive root modulo MOD

// power computes (a^b) % MOD using fast exponentiation
func power(a, b int) int {
	res := 1
	for b > 0 {
		if b&1 == 1 {
			res = (res * a) % MOD
		}
		a = (a * a) % MOD
		b >>= 1
	}
	return res
}

// ntt performs the Number Theoretic Transform (like FFT but mod MOD)
// 'invert' = false -> forward transform; true -> inverse transform
func ntt(a []int, invert bool) {
	n := len(a)

	// Step 1: Bit-reversal permutation
	// We rearrange elements of the array to match butterfly pattern
	for i, j := 1, 0; i < n; i++ {
		bit := n >> 1
		for ; j&bit != 0; bit >>= 1 {
			j ^= bit
		}
		j ^= bit
		if i < j {
			a[i], a[j] = a[j], a[i]
		}
	}

	// Step 2: Cooley–Tukey-style iterative NTT
	for length := 2; length <= n; length <<= 1 {
		// wlen is a principal n-th root of unity modulo MOD
		wlen := power(ROOT, (MOD-1)/length)
		if invert {
			// For inverse NTT, use modular inverse of wlen
			wlen = power(wlen, MOD-2)
		}
		for i := 0; i < n; i += length {
			w := 1
			for j := 0; j < length/2; j++ {
				// Butterfly operation
				u := a[i+j]
				v := (a[i+j+length/2] * w) % MOD
				a[i+j] = u + v
				if a[i+j] >= MOD {
					a[i+j] -= MOD
				}
				a[i+j+length/2] = u - v
				if a[i+j+length/2] < 0 {
					a[i+j+length/2] += MOD
				}
				w = (w * wlen) % MOD
			}
		}
	}

	// Step 3: Normalize in case of inverse NTT
	if invert {
		invN := power(n, MOD-2)
		for i := range a {
			a[i] = (a[i] * invN) % MOD
		}
	}
}

// nttMultiply multiplies two polynomials using NTT
func nttMultiply(a, b []int) []int {
	// Ensure length is power of two and large enough for convolution
	n := 1
	for n < len(a)+len(b) {
		n <<= 1
	}

	// Create padded copies of input arrays
	fa := make([]int, n)
	fb := make([]int, n)
	copy(fa, a)
	copy(fb, b)

	// Step 1: Apply forward NTT to both arrays
	ntt(fa, false)
	ntt(fb, false)

	// Step 2: Point-wise multiplication of frequency domain values
	for i := 0; i < n; i++ {
		fa[i] = (fa[i] * fb[i]) % MOD
	}

	// Step 3: Apply inverse NTT to get back to time domain
	ntt(fa, true)

	return fa // Resulting polynomial coefficients modulo MOD
}

// simpleMultiply is a naive O(n^2) polynomial multiplication
func simpleMultiply(a, b []int) []int {
	n := len(a)
	m := len(b)
	res := make([]int, n+m-1)
	for i := 0; i < n; i++ {
		for j := 0; j < m; j++ {
			res[i+j] = (res[i+j] + a[i]*b[j]) % MOD
		}
	}
	return res
}

func testMain() {
	// Create two example polynomials of size 4096 (to see time difference)
	n := 1 << 12 // 2^12 = 4096
	a := make([]int, n)
	b := make([]int, n)

	// Initialize polynomials with dummy data
	for i := 0; i < n; i++ {
		a[i] = i % 100
		b[i] = (i * 2) % 100
	}

	// Measure time for naive multiplication
	startSimple := time.Now()
	simpleResult := simpleMultiply(a, b)
	elapsedSimple := time.Since(startSimple)

	// Measure time for NTT-based multiplication
	startNTT := time.Now()
	nttResult := nttMultiply(a, b)
	elapsedNTT := time.Since(startNTT)

	// Print performance comparison
	fmt.Printf("Simple Multiply Time: %v\n", elapsedSimple)
	fmt.Printf("NTT Multiply Time:    %v\n", elapsedNTT)

	// Validate both results are same (they should be!)
	same := true
	for i := range simpleResult {
		if simpleResult[i] != nttResult[i] {
			same = false
			break
		}
	}
	if same {
		fmt.Println("✅ Both methods give the same result.")
	} else {
		fmt.Println("❌ Results differ!")
	}
}
