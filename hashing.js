function bipartiteGraph() {
	const INF = Math.MAX_SAFE_INT;
	this.whiteSet = [];
	this.blackSet = [];
	this.edges = [];
	this.__pairU = [];
	this.__pairV = [];
	this.distances = [];
	this.addWhiteVertex = function(u) { this.edges[u] = []; this.whiteSet.push(u); }
	this.addBlackVertex = function(v) { this.edges[v] = []; this.blackSet.push(v); }
	this.addEdgePair = function(u, v) { this.edges[u].push(v); this.edges[v].push(u); }
	this.composeEdges = function(vertex, edge1, edge2) { return this.edges[this.edges[vertex][outedge]][inedge]; }
	this.broadSearch = function() {
		let queue = [];
		for (let u = 1; u <= this.edges.length; u++) {
      		if (this.__pairU[u] === null || this.__pairU[u] === undefined) {
        		this.distances[u] = 0;
        		queue.push(u);
      		} else { this.distances[u] = INF; }
    	}
    	this.distances[0] = INF;
		while (queue.length > 0) {
			const first = queue.shift();
			const u = queue.shift();
			if (this.distances[u] < this.distances[0]) {
				for (const v of this.edges[u]) {
					if (this.distances[this.__pairV[v]] === INF) {
						this.distances[this.__pairV[v]] = this.distances[u] + 1;
						queue.push(this.__pairV[v]);
					}
				}
			}
		}
		return this.distances[0] !== INF;
	}
	this.deepSearch = function(u) {
		if (u !== 0) {
			let stack = [u], isVisited = Array(this.whiteSet.length + this.blackSet.length + 1).fill(false);
			while (stack.length > 0) {
				const last = stack.pop();
				isVisited[last] = true;
				for (const v of this.edges[last]) {
					if (this.distances[this.__pairV[v]] === this.distances[u] + 1) {
						if (isVisited[this.__pairV[v]]) {
							this.__pairV[v] = u;
							this.__pairU[u] = v;
							return true;
						}
					}
				}
			}
			this.distances[u] = INF;
			return false;
		}
    	return true;
	}
	this.hopcroftKarp = function() {
		this.__pairU = Array(this.edges.length + 1).fill(0);
		this.__pairV = Array(this.edges.length + 1).fill(0);
		this.distances = Array(this.edges.length + 1).fill(0);
		let result = 0, path = [];
		while (this.broadSearch()) {
			for (let u = 1; u <= this.edges.length; u++) {
				if (this.__pairU[u] === null || this.__pairU[u] === undefined && this.deepSearch(u)) result++;
			}
		}
		let path = [];
		for (let key in this.__pairU) path.push([key, this.__pairU[key]]);
		return path; //path.length is the size of the maximum matching
	}
}

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

function KISS_cuckoo_hash_table() {
	this.keyCount = 0;
	this.capacity = 0;
	this.keySet = new Array(this.capacity);
	this.values = new Array(this.capacity);
	this.main_hash = function(key) { return key % this.capacity; };
	this.secondary_hash = function(key) { return key % this.capacity; };
	this.tertiary_hash = function(key) { return key % this.capacity; };
	this.rehash = function() {
		const NUMKEYS = this.keyCount;
		this.capacity = this.keyCount * 2;

		let isFull = 0n, validKeys = [], assocVals = [];
		//Dump what's left inside this.keySet into the queue
		for (key in this.keySet) {
			validKeys.push(this.keySet[key]);
			assocVals.push(this.values[key]);
		}
		this.keySet = new Array(this.capacity);
		this.values = new Array(this.capacity);
		this.keyCount = 0;
		
		while (this.keyCount < NUMKEYS) {
			//Select 3 new hash functions from a known universal hash family
			const r1 = Math.floor(Math.random() * this.capacity), r2 = Math.floor(Math.random() * this.capacity);
			this.main_hash = function(key) { return (key * r1 + r2) % this.capacity; };
			const r3 = Math.floor(Math.random() * this.capacity), r4 = Math.floor(Math.random() * this.capacity);
			this.secondary_hash = function(key) { return (key * r3 + r4) % this.capacity; };
			const r5 = Math.floor(Math.random() * this.capacity), r6 = Math.floor(Math.random() * this.capacity);
			this.tertiary_hash = function(key) { return (key * r5 + r6) % this.capacity; };

			//Inject into the cuckoo hash tables
   			let secondaryKeys = new Array(this.capacity), secondaryValues = new Array(this.capacity);
			let matchedIdxs = new Array(validKeys.length), choices = new Array(validKeys.length);
			let successfulMatches = 0, failed = false;
			for (let idx = 0; idx < this.capacity; idx++) { secondaryKeys[idx] = null; secondaryValues[idx] = null; }
			for (let idx = 0; idx < validKeys.length; idx++) { counters[idx] = 7; }
			
			while (successfulMatches < NUMKEYS && !failed) {
				for (let idx = 0; idx < NUMKEYS; idx++) {
					if (choices[idx] === 0) { failed = true; break; } //No injection exists
					const curKey = validKeys[idx], curVal = assocVals[idx];
					if (secondaryKeys[this.main_hash(curKey)] !== curKey && secondaryKeys[this.secondary_hash(curKey)] !== curKey && secondaryKeys[this.tertiary_hash(curKey)] !== curKey) {
						let shortestChain = (choices[idx] & 1) == 1 ? this.main_hash(curKey) : null, proposal = (choices[idx] & 1) == 1 ? 1 : 0;
						if ((choices[idx] & 2) == 2 && (shortestChain === null || secondaryKeys[shortestChain] === null)) { shortestChain = this.secondary_hash(curKey); proposal = 2; }
						if ((choices[idx] & 4) == 4 && (shortestChain === null || secondaryKeys[shortestChain] === null)) { shortestChain = this.tertiary_hash(curKey); proposal = 4; }
		
						if (secondaryKeys[shortestChain] === null) {
							matchedIdxs[shortestChain] = idx;
							successfulMatches++;
						} else {
							const evictedIdx = matchedIdxs[shortestChain];
							choices[evictedIdx] &= ~proposal;
						}
						secondaryKeys[shortestChain] = curKey;
						secondaryValues[shortestChain] = curVal;
					}
				}
			}
			if (!failed && successfulMatches >= NUMKEYS) {
				this.keySet = secondaryKeys;
				this.values = secondaryValues;
				this.keyCount = successfulMatches;
			}
		}
	};
	this.iskey = function(key) {
		const hash1 = this.main_hash(key), hash2 = this.secondary_hash(key), hash3 = this.tertiary_hash(key);
		return this.keySet[hash1] === key || this.keySet[hash2] === key || this.keySet[hash3] === key;
	};
	this.insert = function(key, value) {
		const hash1 = this.main_hash(key), hash2 = this.secondary_hash(key), hash3 = this.tertiary_hash(key);
		if (this.keySet[hash1] === key) { this.values[hash1] = value; return; }
		if (this.keySet[hash2] === key) { this.values[hash2] = value; return; }
		if (this.keySet[hash3] === key) { this.values[hash3] = value; return; }

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

		//Couldn't find a slot, lets rehash!
		this.rehash();
		this.insert(key, value);
	};
	this.lookup = function(key) {
		if (!this.iskey(key)) return null;
		const hash1 = this.main_hash(key), hash2 = this.secondary_hash(key), hash3 = this.tertiary_hash(key);
		if (this.keySet[hash1] === key) { return this.values[hash1]; }
		if (this.keySet[hash2] === key) { return this.values[hash2] = value; }
		return this.values[hash3];
	};
	this.delete = function(key) {
		if (!this.iskey(key)) return;
		const hash1 = this.main_hash(key), hash2 = this.secondary_hash(key), hash3 = this.tertiary_hash(key);
		if (this.keySet[hash1] === key) { this.keySet[hash1] = null; this.values[hash1] = null; return; }
		if (this.keySet[hash2] === key) { this.keySet[hash2] = null; this.values[hash2] = null; return; }
		this.keySet[hash3] = null; this.values[hash3] = null;
	};
	this.clear = function() {
		this.keyCount = 0;
		this.capacity = 0;
		this.keySet = new Array(this.capacity);
		this.values = new Array(this.capacity);
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
			
			//Select 2 new hash functions from a known universal hash family
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
