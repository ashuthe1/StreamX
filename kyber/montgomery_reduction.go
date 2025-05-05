package kyber

import (
	"fmt"
	"math/big"
)

// montgomeryReduce performs the Montgomery reduction step.
func montgomeryReduce(T, m, R *big.Int) *big.Int {
	// m' is the modular inverse of m modulo R
	mInv := new(big.Int).ModInverse(m, R)

	// T = (T + (T * m' mod R) * m) / R
	// First, compute T * m' % R
	TmInv := new(big.Int).Mul(T, mInv)
	TmInv.Mod(TmInv, R)

	// Now compute (T + (T * m' % R) * m) / R
	TmInv = new(big.Int).Mul(TmInv, m)
	TmInv.Add(T, TmInv)

	// Finally, divide by R (which is a power of 2, so we can just shift bits)
	TmInv.Div(TmInv, R)

	// If TmInv is >= m, we subtract m to keep the result in the correct range
	if TmInv.Cmp(m) >= 0 {
		TmInv.Sub(TmInv, m)
	}
	return TmInv
}

// montgomeryMultiply performs the Montgomery multiplication of a and b mod m.
func montgomeryMultiply(a, b, m, R *big.Int) *big.Int {
	// Compute the product of a and b in the Montgomery domain
	// T = a * b
	T := new(big.Int).Mul(a, b)

	// Perform the Montgomery reduction to get the result in the Montgomery form
	return montgomeryReduce(T, m, R)
}

// modInverse computes the modular inverse of a modulo m using the Extended Euclidean Algorithm.
func modInverse(a, m *big.Int) *big.Int {
	// Extended Euclidean algorithm to find the modular inverse
	g, x, _ := extendedGCD(a, m)
	if g.Cmp(big.NewInt(1)) != 0 {
		// No inverse exists if gcd(a, m) != 1
		return nil
	}
	if x.Cmp(big.NewInt(0)) < 0 {
		x.Add(x, m)
	}
	return x
}

// extendedGCD performs the Extended Euclidean Algorithm to return gcd(a, m), and the coefficients x, y such that a*x + m*y = gcd(a, m)
func extendedGCD(a, m *big.Int) (*big.Int, *big.Int, *big.Int) {
	// Initialize x = 0, y = 1, previous_x = 1, previous_y = 0
	previousX, x := big.NewInt(1), big.NewInt(0)
	previousY, y := big.NewInt(0), big.NewInt(1)
	previousR, r := new(big.Int).Set(m), new(big.Int).Set(a)

	for r.Cmp(big.NewInt(0)) != 0 {
		quotient := new(big.Int).Div(previousR, r)

		// Update the remainder
		previousR, r = r, new(big.Int).Mod(previousR, r)

		// Update x and y
		previousX, x = x, new(big.Int).Sub(previousX, new(big.Int).Mul(quotient, x))
		previousY, y = y, new(big.Int).Sub(previousY, new(big.Int).Mul(quotient, y))
	}

	return previousR, previousX, previousY
}

func testMain2() {
	// Example numbers for multiplication
	a := new(big.Int)
	b := new(big.Int)
	m := new(big.Int)

	// Set a, b, and m values (large numbers for demonstration)
	a.SetString("123456789012345678901234567890", 10)
	b.SetString("987654321098765432109876543210", 10)
	m.SetString("1000000007", 10) // A prime number modulus for example

	// We choose R to be a power of 2 greater than the modulus m
	// R should be at least as large as m, so we choose a power of 2
	R := new(big.Int).Lsh(big.NewInt(1), 256) // R = 2^256

	// Step 1: Convert a and b into Montgomery form
	aMontgomery := new(big.Int).Mul(a, R)
	aMontgomery.Mod(aMontgomery, m)
	bMontgomery := new(big.Int).Mul(b, R)
	bMontgomery.Mod(bMontgomery, m)

	// Step 2: Perform Montgomery multiplication
	result := montgomeryMultiply(aMontgomery, bMontgomery, m, R)

	// Step 3: Convert the result back from Montgomery form to the regular result
	finalResult := montgomeryReduce(result, m, R)

	// Print the final result
	fmt.Println("Montgomery multiplication result:", finalResult)
}

// 𝑎 = 123456789012345678901234567890
// 𝑏 = 987654321098765432109876543210
// 𝑚 = 1000000007 (a large prime modulus)
// 𝑅 = 2^256  (a power of 2 chosen as R)
