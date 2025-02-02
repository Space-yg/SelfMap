/**
 * Get all literal keys of a type
 * 
 * @example
 * type User = {
 *     id: number
 *     name: string
 *     age: number
 *     [other: string]: any // Other information
 * }
 * 
 * type KeysOfUser = keyof User
 * // -> string | number
 * 
 * type LiteralKeysOfUser = LiteralKeys<User>
 * // -> "id" | "name" | "age"
 */
type LiteralKeys<T> = keyof {
	[K in keyof T as
	string extends K ? never :
	number extends K ? never :
	symbol extends K ? never :
	K]: 0
}

interface SelfMapIterator<T> extends IteratorObject<T, BuiltinIteratorReturn, unknown> {
	[Symbol.iterator](): SelfMapIterator<T>
}

/**
 * A map that maps a unique property in objects to the objects themselves.
 * @template T The type of the object
 * @template K The key of the unique property. Must be a literal key in `T`
 */
export default class SelfMap<T extends Record<string | number | symbol, any>, K extends LiteralKeys<T>> {
	////////////////////
	//// Properties ////
	////////////////////

	/** The values associated with the map */
	#values: T[]
	/** The unique property of the map */
	readonly #uniqueProperty: K

	/////////////////
	//// Getters ////
	/////////////////

	/** The unique property of the map */
	get uniqueProperty(): K { return this.#uniqueProperty }

	/** The size of the map */
	get size(): number { return this.#values.length }

	//////////////////////
	//// Constructors ////
	//////////////////////

	constructor(objects: T[], uniqueProperty: K) {
		this.#values = objects
		this.#uniqueProperty = uniqueProperty
	}

	/////////////////////////
	//// Private Methods ////
	/////////////////////////

	/**
	 * Check if a value is of type key
	 * @param value The value to check
	 * @returns `true` if value is of type key; `false` otherwise
	 */
	#isKey(value: any): boolean {
		return typeof value === "string" || typeof value === "number"
	}

	////////////////////////
	//// Public Methods ////
	////////////////////////

	/**
	 * Check if key exits in the map
	 * @param key The key to check
	 */
	has(key: T[K]): boolean
	/**
	 * Check if value exists in the map
	 * @param value 
	 */
	has(value: T): boolean
	has(keyOrValue: T | T[K]): boolean {
		// T[K]
		if (this.#isKey(keyOrValue)) return this.#values.some(ele => ele[this.#uniqueProperty] === keyOrValue)
		// K
		else return this.#values.some(ele => ele === keyOrValue)
	}

	/**
	 * Add a value to the map
	 * @param value The value to add
	 * @returns The map itself
	 */
	add(value: T): this {
		// If value is NOT in #objects (Checking reference)
		if (!this.has(value)) {
			// Has the same key as another object (Checking key)
			if (this.has(value[this.#uniqueProperty])) this.#values[this.#values.findIndex(ele => ele[this.#uniqueProperty] === value[this.#uniqueProperty])] = value
			else this.#values.push(value)
		}

		return this
	}

	/**
	 * Get the value associated with a key
	 * @param key The key to use to get the value associated with
	 * @returns The value; `undefined` if not found
	 */
	get(key: T[K]): T | undefined {
		for (const ele of this.#values) if (ele[this.#uniqueProperty] === key) return ele
		return undefined
	}

	/**
	 * Loop over each element in the map
	 * @param callbackfn The callback function to call on each element
	 * @param thisArg The value of `this` in the callback function
	 */
	forEach(callbackfn: (
		/** A value in the map */
		value: T,
		/** The key associated with the value */
		key: T[K],
		/** The map itself */
		selfMap: SelfMap<T, K>
	) => void, thisArg?: any): void {
		this.#values.forEach(ele => callbackfn(ele, ele[this.#uniqueProperty], this), thisArg)
	}

	/**
	 * Get all the keys in the map
	 */
	keys(): SelfMapIterator<keyof T> {
		return Iterator.from(this.#values.map(ele => ele[this.#uniqueProperty]))
	}

	/**
	 * Get all values in the map
	 */
	values(): SelfMapIterator<T> {
		return Iterator.from(this.#values)
	}

	/**
	 * Clear the map
	 */
	clear(): void {
		this.#values = []
	}

	/**
	 * Delete a key-value pair in the map
	 * @param key The key to delete itself and the value associated with it
	 * @returns The value associated with that key
	 */
	delete(key: T[K]): T | undefined
	/**
	 * Delete a key-value pair in the map
	 * @param value The value to delete itself and the key associated with it
	 * @returns The key associated with that value
	 */
	delete(value: T): T[K] | undefined
	delete(keyOrValue: T | T[K]): T | T[K] | undefined {
		const isKey: boolean = this.#isKey(keyOrValue)
		let index: number
		// T[K]
		if (isKey) index = this.#values.findIndex(ele => ele[this.#uniqueProperty] === keyOrValue)
		// T
		else index = this.#values.findIndex(ele => ele === keyOrValue)

		// No such key or value
		if (index === -1) return undefined

		// Return deleted key or value
		if (isKey) return this.#values.splice(index, 1)[0]
		else return this.#values.splice(index, 1)[0][this.#uniqueProperty]
	}

	/**
	 * Get all entries of the map
	 */
	entries(): SelfMapIterator<[T[K], T]> {
		return Iterator.from(this.#values.map(ele => [ele[this.#uniqueProperty], ele]))
	}

	/**
	 * Loop over all the values in the map
	 */
	[Symbol.iterator](): SelfMapIterator<[T[K], T]> {
		return this.entries()
	}

	/**
	 * Prints out this map
	 */
	print(): void {
		if (this.#values.length !== 0) {
			console.log(`SelfMap(${this.size}) {`)
			this.#values.forEach(ele => console.log(" ", ele[this.#uniqueProperty], "=>", ele))
			console.log("}")
		} else console.log(`SelfMap(${this.size}) {}`)
	}

	/**
	 * Alias for {@link SelfMap.print print}
	 */
	log(): void { this.print() }

	/**
	 * A string representation of the map
	 */
	toString(): string {
		if (this.#values.length === 0) return `SelfMap(${this.size}) {}`

		let str = `SelfMap(${this.size}) {\n`
		this.#values.forEach(ele => str += `  ${ele[this.#uniqueProperty]} => ${ele}\n`)
		str += "}"
		return str
	}

	/**
	 * A string representation of the map
	 */
	[Symbol.toStringTag](): string {
		return this.toString()
	}
}