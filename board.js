class Board {
	constructor() {
		this.cells = [];
		this.row_fill = [];
		this.columns = [];
		this.g_piss = [];
		this.fill = 0;
		for(let y = 0; y < 20; y++) {
			this.cells.push([]);
			this.row_fill.push(0);
			for(let x = 0; x < 10; x++) {
				this.cells[y].push("empty");
			}
		}
		for(let x = 0; x < 10; x++) {
			this.columns.push(0);
			this.g_piss.push(0);
		}
	}
	clear_row(y) {
		for(let x = 0; x < 10; x++) {
			this.columns[x] = remove_bit(this.columns[x], y);
			this.g_piss[x] = remove_bit(this.g_piss[x], y);
		}
		let [ row ] = this.cells.splice(y, 1);
		for(let x = 0; x < 10; x++) {
			row[x] = "empty";
		}
		this.cells.push(row);
		this.row_fill.splice(y, 1);
		this.row_fill.push(0);
		this.fill -= 10;
	}
	clear_column(x, y) {
		let bottom = 32 - Math.clz32(this.g_piss[x] & ~(-1 << y));
		let top = ctz32(~this.columns[x] & -1 << bottom);
		if(y >= top) {
			return false;
		}
		let mask = ~(-1 << top) & (-1 << bottom);
		this.columns[x] &= ~mask;
		this.g_piss[x] &= ~mask;
		for(let y = bottom; y < top; y++) {
			this.cells[y][x] = "empty";
			this.row_fill[y]--;
			this.fill--;
		}
		return true;
	}
	unset_cell(x, y) {
		if(y >= 20) {
			return;
		}
		this.cells[y][x] = "empty";
		this.columns[x] &= ~(1 << y);
		this.g_piss[x] &= ~(1 << y);
		this.row_fill[y]--;
		this.fill--;
	}
	set_cell_g_piss(x, y) {
		if(y >= 20) {
			return;
		}
		this.cells[y][x] = "g piss";
		this.columns[x] |= 1 << y;
		this.g_piss[x] |= 1 << y;
		this.row_fill[y]++;
		this.fill++;
	}
	set_cell_other(x, y, piss) {
		if(y >= 20) {
			return;
		}
		this.cells[y][x] = piss;
		this.columns[x] |= 1 << y;
		this.row_fill[y]++;
		this.fill++;
	}
	is_out(x, y) {
		return x < 0 || x >= 10 || y < 0;
	}
	is_set(x, y) {
		return this.is_out(x, y) || (this.columns[x] & 1 << y) !== 0;
	}
	get_height(x, y) {
		return 32 - Math.clz32(this.columns[x] & ~(-1 << y));
	}
}

function remove_bit(x, i) {
	return (x & -1 << i + 1) >> 1 | x & ~(-1 << i);
}

function ctz32(x) {
	if(x === 0) {
		return 32;
	} else {
		return 31 - Math.clz32(x & -x);
	}
}
