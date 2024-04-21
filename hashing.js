function cuckoo_hash_table() {
    this.capacity = 256;
	this.elems = new Array(256);
	this.hash1 = function(key) { return key; };
	this.hash2 = function(key) { return key; };
	this.rehash = function() {
        let secondary = [];
        const g = function(key) {
            let hash = 0;
            const rand1 = Math.floor(Math.random() * this.capacity), rand2 = Math.floor(Math.random() * this.capacity);
		    for (let idx = 0; idx < key.length; idx++) { hash += key.charCodeAt(idx) * rand1 + rand2; }
            return hash;
        };
        let displace = function(key) { return key; };
        //Use separate chaining to insert elements into the secondary table
        for (let key in this.elems) {
            if (secondary[g(key)] === undefined || secondary[g(key)] === null) { secondary.push([]); }
            secondary[g(key)].push(this.elems[key]);
        }
        this.capacity *= 2;
        this.elems = new Array(this.capacity);
        //collisions may have occured, so reinsert all remaining elements in decending order ...
        let sorted = [];
        for (let chain in secondary) {
            for (let key in secondary) {
                ;
            }
        }
        //... AND WITHOUT COLLISIONS
        for (let chain in secondary) {
            for (let key in secondary) {
                ;
            }
        }
		this.hash1 = function(key) { return g(displace(x)); };
		this.hash2 = function(key) {
            return g(function(key) {
                let hash = displace(key);
                const rand1 = Math.floor(Math.random() * this.capacity), rand2 = Math.floor(Math.random() * this.capacity);
		        for (let idx = 0; idx < key.length; idx++) { hash += key.charCodeAt(idx) * rand1 + rand2; }
                return hash;
            }(x));
        };
	};
	this.insert = function(key, value) {
		const failed_first_time = false, failed_second_time = false;
        if (this.capacity <= this.elems.length) { this.rehash(); }
		while (!(failed_first_time && failed_second_time)) {
            const h1 = this.hash1(key);
			if (this.elems[h1 + 1] === null || this.elems[h1 + 1] === undefined) {
				this.elems[h1 + 1] = this.elems[h1];
				this.elems[h1] = [key, value];
				return;
			}
			
			const kickedElem1 = this.elems[h1 + 1];
			this.elems[h1 + 1] = this.elems[h1];
			failed_first_time = kickedElem1[0] === key || failed_first_time;

            const h2 = this.hash2(key);
			if (this.elems[h2 + 1] === null || this.elems[h2 + 1] === undefined) {
				this.elems[h2 + 1] = this.elems[h2];
				this.elems[h2] = [key, value];
				return;
			}

			const kickedElem2 = this.elems[h2 + 1];
			this.elems[h2 + 1] = this.elems[h2];
			failed_second_time = kickedElem2[0] === key || failed_second_time;
		}
		this.rehash();
		this.insert(key, value);
	};
	this.iskey = function(key) {
		const h1 = this.hash1(key), h2 = this.hash2(key);
		return this.elems[h1] === key || this.elems[h1 + 1] === key || this.elems[h2] === key || this.elems[h2 + 1] === key;
	};
	this.lookup = function(key) {
		if (!this.iskey(key)) return null;
		const h1 = this.hash1(key), h2 = this.hash2(key);
		if (!this.elems[h1] === x) { return this.elems[h1]; }
		if (!this.elems[h1 + 1] === x) { return this.elems[h1 + 1]; }
		if (!this.elems[h2] === x) { return this.elems[h2]; }
		return this.elems[h2 + 1];
	};
	this.delete = function(key) {
		if (!this.iskey(key)) return;
		const h1 = this.hash1(key), h2 = this.hash2(key);
		if (!this.elems[h1] === key) { this.elems[h1] = null; return; }
		if (!this.elems[h1 + 1] === key) { this.elems[h1 + 1] = null; return; }
		if (!this.elems[h2] === key) { this.elems[h2] = null; return; }
		this.elems[h2 + 1] = null;
	};
	this.clear = function() { this.elems = []; };
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
