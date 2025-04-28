let rotate_cw_table = {
	"0": "R",
	"R": "2",
	"2": "L",
	"L": "0",
};
let rotate_ccw_table = {};
let rotate_180_table = {};

for(let orientation in rotate_cw_table) {
	let rotated_cw = rotate_cw_table[orientation];
	let rotated_180 = rotate_cw_table[rotated_cw];
	let rotated_ccw = rotate_cw_table[rotated_180];
	rotate_ccw_table[orientation] = rotated_ccw;
	rotate_180_table[orientation] = rotated_180;
}

let offsets_table = {
	"stick": [ [ -1, 0 ], [ 0, 0 ], [ 1, 0 ], [ 2, 0 ] ],
	"sun": [ [ 0, 0 ], [ 1, 0 ], [ 0, 1 ], [ 1, 1 ] ],
	"t piss": [ [ -1, 0 ], [ 0, 0 ], [ 1, 0 ], [ 0, 1 ] ],
	"right snake": [ [ -1, 0 ], [ 0, 0 ], [ 0, 1 ], [ 1, 1 ] ],
	"inverse skew": [ [ 0, 0 ], [ 1, 0 ], [ -1, 1 ], [ 0, 1 ] ],
	"gamma": [ [ -1, 0 ], [ 0, 0 ], [ 1, 0 ], [ -1, 1 ] ],
	"right gun": [ [ -1, 0 ], [ 0, 0 ], [ 1, 0 ], [ 1, 1 ] ],
	"e piss": [ [ -1, 0 ], [ 0, 0 ], [ 1, 0 ], [ 0, 1 ] ],
	"g piss": [ [ -1, 0 ], [ 0, 0 ], [ 1, 0 ], [ 2, 0 ] ],
};
let rotated_offsets_table = {};
let bottom_offset_table = {};
let top_offset_table = {};

let orientation = "0";
let ix = 1;
let iy = 0;
let jx = 0;
let jy = 1;
for(let index = 0; index < 4; index++) {
	rotated_offsets_table[orientation] = {};
	bottom_offset_table[orientation] = {};
	top_offset_table[orientation] = {};
	for(let piss in offsets_table) {
		let bottom = Infinity;
		let top = -Infinity;
		rotated_offsets_table[orientation][piss] = [];
		for(let [ offset_x, offset_y ] of offsets_table[piss]) {
			let rotated_offset_x = ix * offset_x + jx * offset_y;
			let rotated_offset_y = iy * offset_x + jy * offset_y;
			rotated_offsets_table[orientation][piss].push([ rotated_offset_x, rotated_offset_y ]);
			if(rotated_offset_y < bottom) {
				bottom = rotated_offset_y;
			}
			if(rotated_offset_y > top) {
				top = rotated_offset_y;
			}
		}
		bottom_offset_table[orientation][piss] = bottom;
		top_offset_table[orientation][piss] = top;
	}
	orientation = rotate_ccw(orientation);
	let next_jx = -jy;
	let next_jy = jx;
	ix = jx;
	iy = jy;
	jx = next_jx;
	jy = next_jy;
}

let kick_offsets_2x3_table = {
	"0": [ [  0,  0 ], [  0,  0 ], [  0,  0 ], [  0,  0 ], [  0,  0 ] ],
	"R": [ [  0,  0 ], [ +1,  0 ], [ +1, -1 ], [  0, +2 ], [ +1, +2 ] ],
	"2": [ [  0,  0 ], [  0,  0 ], [  0,  0 ], [  0,  0 ], [  0,  0 ] ],
	"L": [ [  0,  0 ], [ -1,  0 ], [ -1, -1 ], [  0, +2 ], [ -1, +2 ] ],
};
let kick_offsets_1x4_table = {
	"0": [ [  0,  0 ], [ -1,  0 ], [ +2,  0 ], [ -1,  0 ], [ +2,  0 ] ],
	"R": [ [ -1,  0 ], [  0,  0 ], [  0,  0 ], [  0, +1 ], [  0, -2 ] ],
	"2": [ [ -1, +1 ], [ +1, +1 ], [ -2, +1 ], [ +1,  0 ], [ -2,  0 ] ],
	"L": [ [  0, +1 ], [  0, +1 ], [  0, +1 ], [  0, -1 ], [  0, +2 ] ],
};
let kick_offsets_2x2_table = {
	"0": [ [  0,  0 ] ],
	"R": [ [  0, -1 ] ],
	"2": [ [ -1, -1 ] ],
	"L": [ [ -1,  0 ] ],
};
let kick_offsets_180_2x3_table = {
	"0": [ [  0,  0 ], [  0,  1 ] ],
	"R": [ [  0,  0 ], [  1,  0 ] ],
	"2": [ [  0,  0 ], [  0,  0 ] ],
	"L": [ [  0,  0 ], [  0,  0 ] ],
};
let kick_offsets_180_1x4_table = {
	"0": [ [  1, -1 ], [  1,  0 ] ],
	"R": [ [ -1, -1 ], [  0, -1 ] ],
	"2": [ [  0,  0 ], [  0,  0 ] ],
	"L": [ [  0,  0 ], [  0,  0 ] ],
};
let kick_offsets_180_2x2_table ={
	"0": [ [  1,  1 ] ],
	"R": [ [  1, -1 ] ],
	"2": [ [  0,  0 ] ],
	"L": [ [  0,  0 ] ],
};

function calculate_kicks_table(kick_offsets_table, kick_offsets_180_table) {
	let kicks = {};
	for(let a in kick_offsets_table) {
		kicks[a] = {};
		for(let b of [ rotate_cw_table[a], rotate_ccw_table[a] ]) {
			kicks[a][b] = [];
			let a_kick_offsets = kick_offsets_table[a];
			let b_kick_offsets = kick_offsets_table[b];
			for(let index = 0; index < a_kick_offsets.length; index++) {
				let [ a_kick_offset_x, a_kick_offset_y ] = a_kick_offsets[index];
				let [ b_kick_offset_x, b_kick_offset_y ] = b_kick_offsets[index];
				let kick_x = a_kick_offset_x - b_kick_offset_x;
				let kick_y = a_kick_offset_y - b_kick_offset_y;
				kicks[a][b].push([ kick_x, kick_y ]);
			}
		}
		let b = rotate_180_table[a];
		kicks[a][b] = [];
		let a_kick_offsets = kick_offsets_180_table[a];
		let b_kick_offsets = kick_offsets_180_table[b];
		for(let index = 0; index < a_kick_offsets.length; index++) {
			let [ a_kick_offset_x, a_kick_offset_y ] = a_kick_offsets[index];
			let [ b_kick_offset_x, b_kick_offset_y ] = b_kick_offsets[index];
			let kick_x = a_kick_offset_x - b_kick_offset_x;
			let kick_y = a_kick_offset_y - b_kick_offset_y;
			kicks[a][b].push([ kick_x, kick_y ]);
		}
	}
	return kicks;
}

let kicks_2x3_table = calculate_kicks_table(kick_offsets_2x3_table, kick_offsets_180_2x3_table);
let kicks_1x4_table = calculate_kicks_table(kick_offsets_1x4_table, kick_offsets_180_1x4_table);
let kicks_2x2_table = calculate_kicks_table(kick_offsets_2x2_table, kick_offsets_180_2x2_table);

let kicks_table = {
	"t piss": kicks_2x3_table,
	"right snake": kicks_2x3_table,
	"inverse skew": kicks_2x3_table,
	"gamma": kicks_2x3_table,
	"right gun": kicks_2x3_table,
	"e piss": kicks_2x3_table,
	"stick": kicks_1x4_table,
	"g piss": kicks_1x4_table,
	"sun": kicks_2x2_table,
};

let color_table = {
	"empty": "black",
	"stick": "cyan",
	"sun": "yellow",
	"t piss": "magenta",
	"right snake": "lime",
	"inverse skew": "red",
	"gamma": "blue",
	"right gun": "orange",
	"e piss": "#ff3774",
	"g piss": "white",
};

function rotate_cw(orientation) {
	return rotate_cw_table[orientation];
}
function rotate_ccw(orientation) {
	return rotate_ccw_table[orientation];
}
function rotate_180(orientation) {
	return rotate_180_table[orientation];
}
function get_offsets(piss, orientation) {
	return rotated_offsets_table[orientation][piss];
}
function get_bottom_offset(piss, orientation) {
	return bottom_offset_table[orientation][piss];
}
function get_top_offset(piss, orientation) {
	return top_offset_table[orientation][piss];
}
function get_kicks(piss, a, b) {
	return kicks_table[piss][a][b];
}
function get_color(piss) {
	return color_table[piss];
}
