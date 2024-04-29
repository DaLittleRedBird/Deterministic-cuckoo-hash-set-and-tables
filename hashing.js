function cuckoo_hash_table() {
	this.capacity = 0;
	this.keyCount = 0;
	this.elems = new Array(this.capacity);
	this.values = new Array(this.capacity);
	this.hash1 = function(key) { return key; };
	this.hash2 = function(key) { return key; };
	this.hash3 = function(key) { return key; };
	this.rehash = function() {
		const NUMKEYS = this.keyCount;
		this.capacity = this.keyCount * 2;

		let isFull = 0n, queue = [], assocVals = [], nodeCnts = [];
		this.keyCount = 0;
		while (this.keyCount < NUMKEYS) {
			//Dump what's left inside this.elems into the queue
			for (key in this.elems) {
				queue.push(this.elems[key]);
				assocVals.push(this.values[key]);
				nodeCnts.push(0);
			}
			this.elems = new Array(this.capacity);
			this.values = new Array(this.capacity);
			//Select 3 new hash functions from a known universal hash family
			;
			//Inject the set S into this.elems via hash functions h1, h2, and h3 OR prove that no such injection exists.
			while (queue.length > 0) {
				let curKey = queue.shift(), curVal = assocVals.shift(), curCnt = nodeCnts.shift(), shift = 1n;
				let hashes = [BigInt(this.hash1(curKey)), BigInt(this.hash2(curKey)), BigInt(this.hash3(curKey))];
				if (curCnt >= 3) {
					//Reset everything (except the capacity) and try again
					for (let cntr in nodeCnts) { nodeCnts[cntr] = 0; }
					queue.push(curKey);
					assocVals.push(curVal);
					nodeCnts.push(0);
					isFull = 0n;
					this.keyCount = 0;
					break;
				}

				shift <<= BigInt(this.hash1(key));
				if ((isEmpty & shift) === 0n) {
					this.elems[hashes[curCnt]] = curKey;
					isEmpty |= shift;
					this.keyCount++;
				} else { queue.push(curKey); nodeCnts.push(curCnt + 1); }
			}
		}
	};
	this.iskey = function(key) {
		const h1 = this.hash1(key), h2 = this.hash2(key)), h3 = this.hash3(key);
		return this.elems[h1] === key || this.elems[h2] === key || this.elems[h3] === key;
	};
	this.insert = function(key, value) {
		const h1 = this.hash1(key), h2 = this.hash2(key)), h3 = this.hash3(key);
		if (this.elems[h1] === key) { this.values[h1] = value; }
		if (this.elems[h2] === key) { this.values[h2] = value; }
		if (this.elems[h3] === key) { this.values[h3] = value; }
		
		if (this.keyCount < this.capacity) 
			//A derandomized 3-hash cuckoo hashing insertion algorithm
			;
		}
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
    this.keySet = [];
	this.whitehash = function(key) { return key; };
	this.blackhash = fingerprinter;
    this.rehash() {
	    this.whitehash = function(key) { return key; };
    };
    this.insert(key) {
		const failed_first_time = false, failed_second_time = false, coreHash = this.whitehash(this.blackhash(key));
        let h1 = this.whitehash(key), h2 = h1 ^ coreHash;
		while (!(failed_first_time && failed_second_time)) {
            h1 = h2 ^ coreHash;
			if (this.keySet[this.hash1(x) + 1] === null || this.elems[this.hash1(x) + 1] === undefined) {
				this.keySet[this.hash1(x) + 1] = this.keySet[this.hash1(x)];
				this.keySet[this.hash1(x)] |= 1;
				return;
			}
			
			const kickedElem1 = this.elems[this.hash1(x) + 1];
			this.elems[this.hash1(x) + 1] = this.elems[this.hash1(key)];
			failed_first_time = kickedElem1[0] === key || failed_first_time;

            h2 = h1 ^ coreHash;
			if (this.elems[this.hash2(x) + 1] === null || this.elems[this.hash2(x) + 1] === undefined) {
				this.elems[this.hash2(x) + 1] = this.elems[this.hash2(x)];
				this.elems[this.hash2(x)] |= 1;
				return;
			}

			const kickedElem2 = this.elems[h2 + 1];
			this.elems[h2 + 1] = this.elems[h2];
			failed_second_time = kickedElem2[0] === key || failed_second_time;
		}
		this.rehash();
		this.insert(key, value);
    };
    this.ismember(key) {
        const h1 = this.whitehash(key), h2 = this.blackhash(key);
        ;
    };
    this.delete(key) {
        const h1 = this.whitehash(key), h2 = this.blackhash(key);
        ;
    };
	this.clear = function() { this.whiteSet = this.blackSet = 0n; };
	this.rehash();
}
