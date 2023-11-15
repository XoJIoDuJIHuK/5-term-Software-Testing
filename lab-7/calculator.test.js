const { add, subtract, multiply, divide } = require('./calculator')

test('sum of 1 and 2 equals 3', () => {
    expect(add(1, 2)).toBe(3)
})

test('sum of zero and any number must not be greater or less than the number', () => {
    for (let num of [-27837376835632786, 126, -34985687, 84653120.023216]) {
        expect(add(num, 0)).not.toBeGreaterThan(num)
        expect(add(num, 0)).not.toBeLessThan(num)
    }
})

test('sum of two not equal values equal by module must return 0', () => {
    expect(add(232789, -232789)).toBe(0)
})

test('quick maths', () => {
    const twoPlusTwo = add(2, 2)
    const minusOne = subtract(twoPlusTwo, 1)
    expect(twoPlusTwo).toBe(4)
    expect(minusOne).toBe(3)
})

test('subtraction of two equal values must return 0', () => {
    expect(subtract(-876543, -876543)).toBe(0)
})

test('subtraction of zero and a number must return number multiplied by minus one', () => {
    expect(subtract(0, -876543)).toBe(multiply(-876543, -1))
})

test('multiplication of any number and 0 equals 0', () => {
    expect(multiply(654321, 0)).toBe(0)
})

test('multiplication of 1.3333 and 3 not equals 4', () => {
    expect(multiply(1.3333, 3)).not.toBe(4)
})

test('division by zero must throw error', () => {
    expect(() => { divide(3, 0) }).toThrow('Division by zero')
})

test('division of any number by 1 returns this number', () => {
    for (let num of [-76543333456787654, 0, 1337, 228, 7654323435657876543456]) {
        expect(divide(num, 1)).toBe(num)
    }
})