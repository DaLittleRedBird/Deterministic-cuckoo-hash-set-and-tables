function cuckoo_hash_table() {
	this.capacity = 0;
	this.keyCount = 0;
	this.elems = new Array(this.capacity);
	this.values = new Array(this.capacity);
	this.hash1 = function(key) { return key % this.capacity; };
	this.hash2 = function(key) { return key % this.capacity; };
	this.hash3 = function(key) { return key % this.capacity; };
	this.rehash = function() {
		const NUMKEYS = this.keyCount;
		this.capacity = this.keyCount * 2;

		let isFull = 0n, queue = [], assocVals = [];
		this.keyCount = 0;
		while (this.keyCount < NUMKEYS) {
			//Dump what's left inside this.elems into the queue
			for (key in this.elems) {
				queue.push(this.elems[key]);
				assocVals.push(this.values[key]);
			}
			this.elems = new Array(this.capacity);
			this.values = new Array(this.capacity);
			
			//Select 3 new hash functions from a known universal hash family
			const r1 = Math.floor(Math.random() * this.capacity), r2 = Math.floor(Math.random() * this.capacity);
			this.hash1 = function(key) { return (key * r1 + r2) % this.capacity; };
			const r3 = Math.floor(Math.random() * this.capacity), r4 = Math.floor(Math.random() * this.capacity);
			this.hash2 = function(key) { return (key * r3 + r4) % this.capacity; };
			const r5 = Math.floor(Math.random() * this.capacity), r6 = Math.floor(Math.random() * this.capacity);
			this.hash3 = function(key) { return (key * r5 + r6) % this.capacity; };
			
			//Inject the set S into this.elems via hash functions h1, h2, and h3 OR prove that no such injection exists.
			while (queue.length > 0) {
				let curKey = queue.shift(), curVal = assocVals.shift();
				let hashes = [BigInt(this.hash1(curKey)), BigInt(this.hash2(curKey)), BigInt(this.hash3(curKey))];
				const shift1 = 1n << hashes[0], shift2 = 1n << hashes[1], shift3 = 1n << hashes[2];
				if ((isFull & shift1) !== 0n && (isFull & shift2) !== 0n && (isFull & shift3) !== 0n) {
					//Reset everything (except the capacity) and try again
					queue.push(curKey);
					assocVals.push(curVal);
					isFull = 0n;
					this.keyCount = 0;
					break;
				}

				if ((isFull & shift1) === 0n) {
					this.elems[hashes[0]] = curKey;
					this.values[hashes[0]] = curVal;
					isFull |= shift1;
					this.keyCount++;
				} else if ((isFull & shift2) === 0n) {
					this.elems[hashes[1]] = curKey;
					this.values[hashes[1]] = curVal;
					isFull |= shift2;
					this.keyCount++;
				} else { //(isFull & shift3) === 0n
					this.elems[hashes[2]] = curKey;
					this.values[hashes[2]] = curVal;
					isFull |= shift3;
					this.keyCount++;
				}
				/*
				const hash1 = this.hash1(key), hash2 = this.hash2(key), hash3 = this.hash3(key);
				if (this.elems[hash1] === key) { this.values[hash1] = value; return; }
				if (this.elems[hash2] === key) { this.values[hash2] = value; return; }
				if (this.elems[hash3] === key) { this.values[hash3] = value; return; }

				let curKey = key, curVal = value, isFull = 0n;
				//A derandomized 3-hash cuckoo hashing insertion algorithm
				const hashes = [hash1, hash2, hash3];
		for (let curHash = 0; curHash < hashes.length; curHash++) {
			const hash = hashes[curHash];
			if (!this.elems[hash]) { this.values[hash] = curVal; this.keyCount++; return; }
	   		let keystack = [curKey], valstack = [curVal], path = [hash];
			
	    	const tempKey = this.elems[hash];
			this.elems[hash] = curKey;
	 		curKey = tempKey;
	   		const tempVal = this.values[hash];
			this.values[hash] = curVal;
	 		curKey = tempVal;
			isFull |= 1n << BigInt(hash);
			let hasFailed = false;
			
			//Reverse deep search from each hash
	    	while (!hasFailed) {
				hasFailed = true;
				const h1 = this.hash1(curKey), h2 = this.hash2(curKey), h3 = this.hash3(curKey);
	   			if ((isFull & 1n << BigInt(h1)) === 0n) {
		   			if (!this.elems[h1]) { this.values[h1] = curVal; this.keyCount++; return; }
					path.push(h1); keystack.push(curKey); valstack.push(curVal);
					
		   			const tempKey = this.elems[h1];
					this.elems[h1] = curKey;
		 			curKey = tempKey;
		   			const tempVal = this.values[h1];
					this.values[h1] = curVal;
		 			curKey = tempVal;
					isFull |= 1n << BigInt(h1);
					hasFailed = false;
				}
				if ((isFull & 1n << BigInt(h2)) === 0n) {
		   			if (!this.elems[h2]) { this.values[h2] = curVal; this.keyCount++; return; }
					path.push(h2); keystack.push(curKey); valstack.push(curVal);
					
		   			const tempKey = this.elems[h2];
					this.elems[h2] = curKey;
		 			curKey = tempKey;
		   			const tempVal = this.values[h2];
					this.values[h2] = curVal;
		 			curKey = tempVal;
					isFull |= 1n << BigInt(h2);
					hasFailed = false;
				}
				if ((isFull & 1n << BigInt(h3)) === 0n) {
		   			if (!this.elems[h3]) { this.values[h3] = curVal; this.keyCount++; return; }
					path.push(h3); keystack.push(curKey); valstack.push(curVal);
					
		   			const tempKey = this.elems[h3];
					this.elems[h3] = curKey;
		 			curKey = tempKey;
		   			const tempVal = this.values[h3];
					this.values[h3] = curVal;
		 			curKey = tempVal;
					isFull |= 1n << BigInt(h3);
					hasFailed = false;
				}
			}
			while (stack.length > 0) {
				const curTopKey = keystack.pop(), curTopVal = valstack.pop(), curEdge = path.pop();
				const tempKey = this.elems[curEdge];
				this.elems[curEdge] = curTopKey;
	 			curKey = tempKey;
	   			const tempVal = this.values[curEdge];
				this.values[curEdge] = curTopVal;
	 			curKey = tempVal;
			}
			isFull = 0n;
		}
  		*/
			}
		}
	};
	this.iskey = function(key) {
		const h1 = this.hash1(key), h2 = this.hash2(key)), h3 = this.hash3(key);
		return this.elems[h1] === key || this.elems[h2] === key || this.elems[h3] === key;
	};
	this.insert = function(key, value) {
		const hash1 = this.hash1(key), hash2 = this.hash2(key), hash3 = this.hash3(key);
		if (this.elems[hash1] === key) { this.values[hash1] = value; return; }
		if (this.elems[hash2] === key) { this.values[hash2] = value; return; }
		if (this.elems[hash3] === key) { this.values[hash3] = value; return; }

		let curKey = key, curVal = value, isFull = 0n;
		//A derandomized 3-hash cuckoo hashing insertion algorithm
		const hashes = [hash1, hash2, hash3];
		for (let curHash = 0; this.keyCount < this.capacity && curHash < hashes.length; curHash++) {
			const hash = hashes[curHash];
			if (!this.elems[hash]) { this.values[hash] = curVal; this.keyCount++; return; }
	   		let path = [hash];
			const tempKey = this.elems[hash];
			this.elems[hash] = curKey;
	 		curKey = tempKey;
	   		const tempVal = this.values[hash];
			this.values[hash] = curVal;
	 		curVal = tempVal;
			isFull |= 1n << BigInt(hash);
			let hasFailed = false;
			//Reverse deep search from each hash
			while (!hasFailed) {
				hasFailed = true;
				const h1 = this.hash1(curKey), h2 = this.hash2(curKey), h3 = this.hash3(curKey);
	   			if ((isFull & 1n << BigInt(h1)) === 0n) {
		   			if (!this.elems[h1]) { this.values[h1] = curVal; this.keyCount++; return; }
					path.push(h1);
		   			const tempKey = this.elems[h1];
					this.elems[h1] = curKey;
		 			curKey = tempKey;
		   			const tempVal = this.values[h1];
					this.values[h1] = curVal;
		 			curVal = tempVal;
					isFull |= 1n << BigInt(h1);
					hasFailed = false;
				}
				if ((isFull & 1n << BigInt(h2)) === 0n) {
		   			if (!this.elems[h2]) { this.values[h2] = curVal; this.keyCount++; return; }
					path.push(h2);
		   			const tempKey = this.elems[h2];
					this.elems[h2] = curKey;
		 			curKey = tempKey;
		   			const tempVal = this.values[h2];
					this.values[h2] = curVal;
		 			curVal = tempVal;
					isFull |= 1n << BigInt(h2);
					hasFailed = false;
				}
				if ((isFull & 1n << BigInt(h3)) === 0n) {
		   			if (!this.elems[h3]) { this.values[h3] = curVal; this.keyCount++; return; }
					path.push(h3);
		   			const tempKey = this.elems[h3];
					this.elems[h3] = curKey;
		 			curKey = tempKey;
		   			const tempVal = this.values[h3];
					this.values[h3] = curVal;
		 			curVal = tempVal;
					isFull |= 1n << BigInt(h3);
					hasFailed = false;
				}
			}
			while (path.length > 0) {
				const curEdge = path.pop();
				const tempKey = this.elems[curEdge];
				this.elems[curEdge] = curKey;
	 			curKey = tempKey;
	   			const tempVal = this.values[curEdge];
				this.values[curEdge] = curVal;
	 			curVal = tempVal;
			}
			isFull = 0n;
		}

		/*while ((isFull & shift1) === 0n || (isFull & shift2) === 0n || (isFull & shift3) === 0n) {
			const h1 = this.hash1(curKey);
			const tempKey1 = this.elems[h1], tempVal1 = this.values[h1];
			this.elems[h1] = curKey;
			this.values[h1] = curVal;
			isFull |= 1n << BigInt(h1);

			const h2 = this.hash2(tempKey1);
			const tempKey2 = this.elems[h2], tempVal2 = this.values[h2];
			this.elems[h2] = tempKey1;
			this.values[h2] = tempVal1;
			isFull |= 1n << BigInt(h2);
			
			const h3 = this.hash3(tempKey2);
			const tempKey3 = this.elems[h3], tempVal3 = this.values[h3];
			this.elems[h3] = tempKey2;
			this.values[h3] = tempVal2;
			isFull |= 1n << BigInt(h3);

			curKey = tempKey3;
			curVal = tempVal3;
			shift1 = 1n << BigInt(this.hash1(curKey));
			shift2 = 1n << BigInt(this.hash2(curKey));
			shift3 = 1n << BigInt(this.hash3(curKey));
		}*/
		//Couldn't find a slot, lets rehash!
		this.rehash();
		this.insert(key, value);
	};
	this.lookup = function(key) {
		if (!this.iskey(key)) return null;
		const h1 = this.hash1(key), h2 = this.hash2(key), h3 = this.hash3(key);
		if (!this.elems[h1] === x) { return this.elems[h1]; }
		if (!this.elems[h2] === x) { return this.elems[h2]; }
		return this.elems[h3];
	};
	this.delete = function(key) {
		if (!this.iskey(key)) return;
		const h1 = this.hash1(key), h2 = this.hash2(key), h3 = this.hash3(key);
		if (!this.elems[h1] === key) { this.elems[h1] = null; this.keyCount--; return; }
		if (!this.elems[h2] === key) { this.elems[h2] = null; this.keyCount--; return; }
		this.elems[h3] = null; this.keyCount--;
	};
	this.clear = function() {
		this.keyCount = 0;
		this.capacity = 0;
		this.elems = new Array(this.capacity);
		this.rehash();
	};
	this.rehash();
}

//A implementation of a type of hash set called a cuckoo hash filter.
function cuckoo_hash_filter(fingerprinter) {
	this.capacity = 0;
	this.keyCount = 0;
	this.keySet = new Array(this.capacity);
	this.hash1 = function(key) { return key % this.capacity; };
	this.hash2 = function(key) { return key % this.capacity; };
	this.rehash = function() {
		const NUMKEYS = this.keyCount;
		this.capacity = this.keyCount * 2;

		let isFull = 0n, queue = [];
		this.keyCount = 0;
		while (this.keyCount < NUMKEYS) {
			//Dump what's left inside this.keySet into the queue
			for (key in this.keySet) { queue.push(this.keySet[key]); }
			this.keySet = new Array(this.capacity);
			
			//Select 3 new hash functions from a known universal hash family
			const r1 = Math.floor(Math.random() * this.capacity), r2 = Math.floor(Math.random() * this.capacity);
			this.hash1 = function(key) { return (key * r1 + r2) % this.capacity; };
			const r3 = Math.floor(Math.random() * this.capacity), r4 = Math.floor(Math.random() * this.capacity);
			this.hash2 = function(key) { return (key * r3 + r4) % this.capacity; };
			
			while (queue.length > 0) {
				let curKey = queue.shift();
				let hashes = [BigInt(this.hash1(curKey)), BigInt(this.hash1(curKey)) ^ fingerprinter(curKey)];
				const shift1 = 1n << hashes[0], shift2 = 1n << hashes[1];
				if ((isFull & shift1) !== 0n && (isFull & shift2) !== 0n) {
					//Reset everything (except the capacity) and try again
					queue.push(curKey);
					isFull = 0n;
					this.keyCount = 0;
					break;
				}

				if ((isFull & shift1) === 0n) {
					this.keySet[hashes[0]] = curKey;
					isFull |= shift1;
					this.keyCount++;
				} else { //(isFull & shift2) === 0n
					this.keySet[hashes[1]] = curKey;
					isFull |= shift2;
					this.keyCount++;
				}
			}
		}
	};
	this.iskey = function(key) {
		const fingerprint = fingerprinter(key);
		const h1 = this.hash1(key), h2 = this.hash1(key) ^ this.hash1(fingerprint);
		return this.keySet[h1] === key || this.keySet[h2] === key;
	};
	this.insert = function(key, value) {
		const fingerprint = fingerprinter(key);
		const hash1 = this.hash1(key), hash2 = BigInt(this.hash1(key)) ^ this.hash1(fingerprint);
		if (!this.keySet[hash1]) { this.keySet[hash1] = fingerprint; return; }
		if (!this.keySet[hash2]) { this.keySet[hash2] = fingerprint; return; }
		if (this.keySet[hash1] === fingerprint || this.keySet[hash2] === fingerprint) { return; }

		let curFingerprint = fingerprint, curHash = Math.floor(Math.random() * 2) ? hash1 : hash2, isFull = 0n;
		let shift = 1n << BigInt(curHash);
		//A derandomized 2-hash cuckoo hashing insertion algorithm
		while ((isFull & shift) === 0n) {
			const tempFingerprint = this.keySet[curHash];
			this.keySet[curHash] = curFingerprint;
			isFull |= 1n << BigInt(curHash);

			curHash ^= this.hash1(tempFingerprint);
			if (!this.keySet[curHash]) { this.keySet[curHash] = tempFingerprint; return; }
			curFingerprint = tempFingerprint;
			shift = 1n << BigInt(curHash);
		}
		//Couldn't find a slot, lets rehash!
		this.rehash();
		this.insert(key, value);
	};
	this.delete = function(key) {
		const fingerprint = fingerprinter(key);
		if (!this.iskey(key)) return null;
		const h1 = this.hash1(key), h2 = this.hash1(key) ^ this.hash1(fingerprint);
		if (!this.keySet[h1] === fingerprint) { this.keySet[h1] = null; this.keyCount--; return; }
		this.keySet[h2] = null; this.keyCount--;
	};
	this.clear = function() {
		this.keyCount = 0;
		this.capacity = 0;
		this.keySet = new Array(this.capacity);
		this.rehash();
	};
	this.rehash();
}
